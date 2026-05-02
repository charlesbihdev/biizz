<?php

namespace App\Http\Requests\Admin;

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Services\Subscription\PlanCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Validates a request to start a Paystack checkout for a paid plan. The
 * BillingController owns the redirect itself; this request only enforces
 * "you own the business and you're choosing a billable, different tier".
 */
class StartSubscriptionCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Business|null $business */
        $business = $this->route('business');

        return $business !== null && $business->isOwnedBy($this->user());
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $billable = array_map(fn (SubscriptionTier $t): string => $t->value, PlanCatalog::paid());

        return [
            'target' => ['required', 'string', Rule::in($billable)],
        ];
    }

    protected function passedValidation(): void
    {
        /** @var Business $business */
        $business = $this->route('business');
        $target = SubscriptionTier::from((string) $this->validated('target'));

        if ($business->subscription_tier === $target) {
            throw ValidationException::withMessages([
                'target' => "You're already on {$target->label()}.",
            ]);
        }
    }

    public function targetTier(): SubscriptionTier
    {
        return SubscriptionTier::from((string) $this->validated('target'));
    }
}
