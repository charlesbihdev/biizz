<?php

namespace App\Services\Subscription;

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Models\SubscriptionInvoice;
use App\Models\User;
use App\Services\Payments\InitializeResult;
use App\Services\Payments\PaystackGateway;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Starts a paid plan checkout: creates a pending SubscriptionInvoice and
 * hands the customer off to Paystack's hosted page. The activation half
 * lives in {@see SubscriptionActivation}.
 */
final class SubscriptionCheckout
{
    public function __construct(
        private readonly PaystackGateway $gateway,
    ) {}

    public const MODE_AUTO = 'auto';

    public const MODE_MANUAL = 'manual';

    public function start(Business $business, SubscriptionTier $target, User $actor, string $mode = self::MODE_AUTO): InitializeResult
    {
        PlanCatalog::assertBillable($target);

        $isManual = $mode === self::MODE_MANUAL;

        $planCode = null;
        if (! $isManual) {
            $planCode = PlanCatalog::paystackPlanCodeFor($target);
            if ($planCode === null) {
                throw new RuntimeException(
                    "No Paystack plan code configured for {$target->value}. Run `php artisan paystack:sync-plans`."
                );
            }
        }

        $price = PlanCatalog::priceFor($target);
        $reference = Str::random(24);

        $invoice = $business->subscriptionInvoices()->create([
            'tier' => $target->value,
            'gateway' => 'paystack',
            'reference' => $reference,
            'amount' => $price,
            'currency' => PlanCatalog::currency(),
            'status' => SubscriptionInvoice::STATUS_PENDING,
            'metadata' => [
                'actor_id' => $actor->id,
                'actor_email' => $actor->email,
                'mode' => $mode,
            ],
        ]);

        return $this->gateway->initializeForPurchase(
            email: $actor->email,
            amountInPesewas: (int) ($price * 100),
            reference: $reference,
            callbackUrl: URL::route('businesses.billing.callback', ['business' => $business->slug]),
            currency: PlanCatalog::currency(),
            metadata: [
                'invoice_id' => $invoice->id,
                'business_id' => $business->id,
                'business_slug' => $business->slug,
                'target_tier' => $target->value,
                'mode' => $mode,
            ],
            plan: $planCode,
        );
    }
}
