<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePaymentKeysRequest;
use App\Models\Business;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    /**
     * Show payment provider connection status.
     * Returns only boolean flags — never cipher text, never plaintext keys.
     */
    public function edit(Business $business): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        return Inertia::render('Admin/Payment/Settings', [
            'business' => $business,
            'providers' => [
                'paystack' => [
                    'connected' => $this->paymentService->hasKey($business, PaymentService::PROVIDER_PAYSTACK),
                    'label'     => 'Paystack',
                    'regions'   => ['Nigeria', 'Ghana', 'Kenya', 'South Africa'],
                ],
                'junipay' => [
                    'connected' => $this->paymentService->hasKey($business, PaymentService::PROVIDER_JUNIPAY),
                    'label'     => 'Junipay',
                    'regions'   => ['West Africa'],
                ],
            ],
        ]);
    }

    /**
     * Encrypt and store a payment provider API key.
     * The plaintext key is handled by PaymentService — never touches a controller property.
     */
    public function store(UpdatePaymentKeysRequest $request, Business $business): RedirectResponse
    {
        $this->paymentService->storeKey(
            $business,
            $request->validated('provider'),
            $request->validated('key'),
            auth()->user()
        );

        return back()->with('success', 'Payment provider connected.');
    }

    /**
     * Remove a payment provider key.
     */
    public function destroy(Business $business, string $provider): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $this->paymentService->removeKey($business, $provider, auth()->user());

        return back()->with('success', 'Payment provider disconnected.');
    }
}
