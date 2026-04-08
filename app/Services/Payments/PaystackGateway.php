<?php

namespace App\Services\Payments;

use App\Models\Business;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaystackGateway implements PaymentGateway
{
    public function __construct(
        private string $secretKey,
    ) {}

    /**
     * Initialize a storefront order payment (physical checkout).
     * Delegates to initializeForPurchase() — zero behaviour change.
     */
    public function initialize(Order $order, Business $business, string $callbackUrl): InitializeResult
    {
        return $this->initializeForPurchase(
            email: $order->customer_email,
            amountInPesewas: (int) ($order->total * 100),
            reference: $order->payment_ref,
            callbackUrl: $callbackUrl,
            currency: $order->currency,
            metadata: ['order_id' => $order->id, 'business_id' => $business->id],
        );
    }

    /**
     * Initialize a marketplace purchase payment.
     * Used directly by MarketplacePurchaseController.
     */
    public function initializeForPurchase(
        string $email,
        int $amountInPesewas,
        string $reference,
        string $callbackUrl,
        string $currency = 'GHS',
        array $metadata = [],
    ): InitializeResult {
        $response = Http::withToken($this->secretKey)
            ->post($this->baseUrl().'/transaction/initialize', [
                'email' => $email,
                'amount' => $amountInPesewas,
                'currency' => $currency,
                'reference' => $reference,
                'callback_url' => $callbackUrl,
                'metadata' => $metadata,
            ]);

        $response->throw();
        $data = $response->json('data');

        return new InitializeResult(
            redirectUrl: $data['authorization_url'],
            reference: $data['reference'],
            accessCode: $data['access_code'] ?? '',
        );
    }

    public function verify(string $reference, Business $business, ?string $providerTransactionId = null): VerificationResult
    {
        $response = Http::withToken($this->secretKey)
            ->get($this->baseUrl().'/transaction/verify/'.rawurlencode($reference));

        $response->throw();
        $data = $response->json('data');

        return new VerificationResult(
            successful: ($data['status'] ?? '') === 'success',
            reference: $data['reference'] ?? $reference,
            transactionId: (string) ($data['id'] ?? ''),
            amountInMinorUnit: (int) ($data['amount'] ?? 0),
            currency: $data['currency'] ?? 'GHS',
            metadata: [
                'fees' => $data['fees'] ?? 0,
                'customer' => [
                    'id' => $data['customer']['id'] ?? null,
                    'email' => $data['customer']['email'] ?? null,
                ],
                'metadata' => $data['metadata'] ?? [],
                'ip' => $data['ip_address'] ?? null,
                'authorization' => $data['authorization'] ?? [],
            ],
        );
    }

    public function verifyWebhookSignature(Request $request, string $secret): bool
    {
        $signature = $request->header('x-paystack-signature');

        if (! $signature) {
            return false;
        }

        $computed = hash_hmac('sha512', $request->getContent(), $secret);

        return hash_equals($computed, $signature);
    }

    private function baseUrl(): string
    {
        return rtrim((string) config('services.paystack.url', 'https://api.paystack.co'), '/');
    }
}
