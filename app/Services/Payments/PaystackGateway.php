<?php

namespace App\Services\Payments;

use App\Models\Business;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaystackGateway implements PaymentGateway
{
    private const BASE_URL = 'https://api.paystack.co';

    public function __construct(
        private string $secretKey,
    ) {}

    public function initialize(Order $order, Business $business, string $callbackUrl): InitializeResult
    {
        $response = Http::withToken($this->secretKey)
            ->post(self::BASE_URL . '/transaction/initialize', [
                'email' => $order->customer_email,
                'amount' => (int) ($order->total * 100), // pesewas
                'currency' => $order->currency,
                'reference' => $order->payment_ref,
                'callback_url' => $callbackUrl,
                'metadata' => [
                    'order_id' => $order->id,
                    'business_id' => $business->id,
                ],
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
            ->get(self::BASE_URL . '/transaction/verify/' . rawurlencode($reference));

        $response->throw();
        $data = $response->json('data');

        return new VerificationResult(
            successful: ($data['status'] ?? '') === 'success',
            reference: $data['reference'] ?? $reference,
            transactionId: (string) ($data['id'] ?? ''),
            amountInMinorUnit: (int) ($data['amount'] ?? 0),
            currency: $data['currency'] ?? 'GHS',
            metadata: [
                'fees'          => $data['fees'] ?? 0,
                'customer'      => [
                    'id'    => $data['customer']['id'] ?? null,
                    'email' => $data['customer']['email'] ?? null,
                ],
                'metadata'      => $data['metadata'] ?? [],
                'ip'            => $data['ip_address'] ?? null,
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
}
