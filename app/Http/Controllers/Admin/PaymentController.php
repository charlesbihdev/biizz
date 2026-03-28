<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePaymentKeysRequest;
use App\Models\Business;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    /**
     * Encrypt and store a payment provider API key (+ client ID for Junipay).
     * The plaintext key is handled by PaymentService — never touches a controller property.
     */
    public function store(UpdatePaymentKeysRequest $request, Business $business): RedirectResponse
    {
        $provider = $request->validated('provider');

        if ($provider === PaymentService::PROVIDER_JUNIPAY && $request->validated('client_id')) {
            $this->paymentService->storeClientId(
                $business,
                $request->validated('client_id'),
                auth()->user()
            );
        }

        $this->paymentService->storeKey(
            $business,
            $provider,
            $request->validated('key'),
            auth()->user()
        );

        if (! $business->default_payment_provider) {
            $business->update(['default_payment_provider' => $provider]);
        }

        return back()->with('success', 'Payment provider connected.');
    }

    /**
     * Set the default payment provider for checkout.
     */
    public function setDefault(Request $request, Business $business): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $provider = $request->validate([
            'provider' => ['required', 'string', 'in:' . PaymentService::PROVIDER_PAYSTACK . ',' . PaymentService::PROVIDER_JUNIPAY],
        ])['provider'];

        $business->update(['default_payment_provider' => $provider]);

        return back()->with('success', ucfirst($provider) . ' set as default provider.');
    }

    /**
     * Remove a payment provider key.
     */
    public function destroy(Business $business, string $provider): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $this->paymentService->removeKey($business, $provider, auth()->user());

        if ($business->default_payment_provider === $provider) {
            $other = $provider === PaymentService::PROVIDER_PAYSTACK
                ? PaymentService::PROVIDER_JUNIPAY
                : PaymentService::PROVIDER_PAYSTACK;

            $business->update([
                'default_payment_provider' => $this->paymentService->hasKey($business->fresh(), $other) ? $other : null,
            ]);
        }

        return back()->with('success', 'Payment provider disconnected.');
    }

    /**
     * Build the providers data array for the settings page.
     */
    public static function providersData(Business $business, PaymentService $paymentService): array
    {
        return [
            'paystack' => [
                'connected' => $paymentService->hasKey($business, PaymentService::PROVIDER_PAYSTACK),
                'label' => 'Paystack',
                'regions' => ['Nigeria', 'Ghana', 'Kenya', 'South Africa'],
            ],
            'junipay' => [
                'connected' => $paymentService->hasKey($business, PaymentService::PROVIDER_JUNIPAY),
                'has_client_id' => ! empty($business->junipay_client_id),
                'label' => 'Junipay',
                'regions' => ['West Africa'],
            ],
        ];
    }
}
