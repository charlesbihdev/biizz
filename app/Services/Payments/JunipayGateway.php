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

    private const NETWORK_PREFIXES = [
        'mtn' => ['23324', '23325', '23353', '23354', '23355', '23359'],
        'airteltigo' => ['23327', '23357', '23326', '23356'],
        'vodafone' => ['23320', '23350'],
    ];

    public function __construct(
        private string $clientId,
        private string $secret,
    ) {}

    public function initialize(Order $order, Business $business, string $callbackUrl): InitializeResult
    {
        $token = $this->getAuthToken();
        $phone = $this->normalizePhone($order->customer_phone ?? '');

        $response = Http::withToken($token)
            ->withHeaders(['clientid' => $this->clientId])
            ->post(self::BASE_URL.'/payment', [
                'email' => $order->customer_email,
                'phoneNumber' => $phone,
                'amount' => (int) $order->total,
                'channel' => 'mobile_money',
                'provider' => $this->detectProvider($phone),
                'description' => "Order #{$order->order_id} for {$business->name}",
                'foreignID' => $order->payment_ref,
                'callbackUrl' => $callbackUrl,
            ]);

        $response->throw();
        $data = $response->json();

        return new InitializeResult(
            redirectUrl: $data['paymentUrl'] ?? $data['payment_url'] ?? '',
            reference: $order->payment_ref,
        );
    }

    /**
     * Verify a payment using Junipay's Check Transaction Status endpoint.
     *
     * The full docs show POST /checktranstatus with { "trans_id": "..." } + clientid header.
     * The transID is Junipay's own transaction id (e.g. COL...), not our foreignID.
     * When $providerTransactionId is available (from webhook trans_id), we use it directly.
     * Otherwise we fall back to $reference (our merchant ref).
     */
    public function verify(string $reference, Business $business, ?string $providerTransactionId = null): VerificationResult
    {
        $token = $this->getAuthToken();
        $transId = $providerTransactionId ?? $reference;

        $response = Http::withToken($token)
            ->withHeaders(['clientid' => $this->clientId])
            ->post(self::BASE_URL.'/checktranstatus', [
                'trans_id' => $transId,
            ]);

        $response->throw();
        $data = $response->json();

        $status = strtolower($data['status'] ?? '');

        return new VerificationResult(
            successful: $status === 'success' || $status === 'completed',
            reference: $reference,
            transactionId: (string) ($data['transaction_id'] ?? $data['trans_id'] ?? $transId),
            amountInMinorUnit: (int) (((float) ($data['amount'] ?? 0)) * 100),
            currency: $data['currency'] ?? 'GHS',
            metadata: $data,
        );
    }

    /**
     * Validate webhook payload shape per Junipay's documented callback contract.
     *
     * Junipay does not provide HMAC signing like Paystack. We validate the payload
     * matches the documented shape, then rely on the mandatory server-side verify()
     * call in the controller before marking anything paid.
     */
    public function verifyWebhookSignature(Request $request, string $secret): bool
    {
        $payload = $request->all();

        return ! empty($payload['foreignID'])
            && ! empty($payload['status'])
            && isset($payload['amount'])
            && ! empty($payload['trans_id']);
    }

    /**
     * Normalize a phone number to international format (233XXXXXXXXX).
     */
    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);

        if (str_starts_with($digits, '0') && strlen($digits) === 10) {
            return '233'.substr($digits, 1);
        }

        if (str_starts_with($digits, '233') && strlen($digits) === 12) {
            return $digits;
        }

        return $digits;
    }

    /**
     * Detect the mobile money network provider from a 233-prefixed phone number.
     */
    private function detectProvider(string $msisdn): string
    {
        foreach (self::NETWORK_PREFIXES as $provider => $prefixes) {
            foreach ($prefixes as $prefix) {
                if (str_starts_with($msisdn, $prefix)) {
                    return $provider;
                }
            }
        }

        return 'mtn';
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
