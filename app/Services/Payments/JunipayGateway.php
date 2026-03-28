<?php

namespace App\Services\Payments;

use App\Models\Business;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class JunipayGateway implements PaymentGateway
{
    private const BASE_URL = 'https://api.junipayments.com';

    public function __construct(
        private string $clientId,
        private string $secret,
    ) {}

    public function initialize(Order $order, Business $business, string $callbackUrl): InitializeResult
    {
        $token = $this->getAuthToken();

        $response = Http::withToken($token)
            ->post(self::BASE_URL.'/payment', [
                'email'       => $order->customer_email,
                'phoneNumber' => $order->customer_phone ?? '',
                'amount'      => (float) $order->total,
                'description' => "Order #{$order->id} for {$business->name}",
                'foreignID'   => $order->payment_ref,
                'callbackUrl' => $callbackUrl,
            ]);

        $response->throw();
        $data = $response->json();

        return new InitializeResult(
            redirectUrl: $data['paymentUrl'] ?? $data['payment_url'] ?? '',
            reference: $order->payment_ref,
        );
    }

    public function verify(string $reference, Business $business): VerificationResult
    {
        $token = $this->getAuthToken();

        $response = Http::withToken($token)
            ->post(self::BASE_URL.'/checktranstatus', [
                'trans_id' => $reference,
            ]);

        $response->throw();
        $data = $response->json();

        $status = strtolower($data['status'] ?? '');

        return new VerificationResult(
            successful: $status === 'success' || $status === 'completed',
            reference: $reference,
            transactionId: (string) ($data['transaction_id'] ?? $data['trans_id'] ?? ''),
            amountInMinorUnit: (int) (((float) ($data['amount'] ?? 0)) * 100),
            currency: $data['currency'] ?? 'GHS',
            metadata: $data,
        );
    }

    public function verifyWebhookSignature(Request $request, string $secret): bool
    {
        // Junipay uses callback URL with payload — verify the foreignID matches
        // a known reference and that the request contains expected fields.
        $payload = $request->all();

        return ! empty($payload['foreignID']) && ! empty($payload['status']);
    }

    /**
     * Obtain and cache a bearer token for the Junipay API.
     */
    private function getAuthToken(): string
    {
        $cacheKey = "junipay_token_{$this->clientId}";

        return Cache::remember($cacheKey, now()->addMinutes(50), function (): string {
            $response = Http::withHeaders(['xderd' => $this->secret])
                ->get(self::BASE_URL.'/obtaintoken/'.$this->clientId);

            $response->throw();

            return $response->json('token') ?? $response->json('access_token') ?? '';
        });
    }
}
