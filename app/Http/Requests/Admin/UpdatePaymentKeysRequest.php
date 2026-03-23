<?php

namespace App\Http\Requests\Admin;

use App\Models\Business;
use App\Services\PaymentService;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentKeysRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Business $business */
        $business = $this->route('business');

        return $business->isOwnedBy($this->user());
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'provider' => ['required', 'string', 'in:' . PaymentService::PROVIDER_PAYSTACK . ',' . PaymentService::PROVIDER_JUNIPAY],
            'key'      => ['required', 'string', 'min:10', 'max:500'],
        ];
    }
}
