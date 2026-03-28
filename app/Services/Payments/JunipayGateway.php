<?php

namespace App\Services\Payments;

use App\Models\Business;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JunipayGateway implements PaymentGateway
{
    private const BASE_URL = 'https://api.junipayments.com';

    public function __construct(
        private string $clientId,
        private string $secret,
        private string $tokenLink,
    ) {}

    public function initialize(Order $order, Business $business, string $callbackUrl): InitializeResult
    {
        throw new \RuntimeException(
            'Junipay uses the inline Payment Form. Use CheckoutController::initiateJunipay() instead.'
        );
    }

    /**
     * Verify a payment using Junipay's Check Transaction Status endpoint.
     *
     * Docs: POST /checktranstatus with body { trans_id } + clientid header.
     * transID is Junipay's own transaction ID (e.g. COL...) from the webhook, not our foreignID.
     * When $providerTransactionId is available (from webhook trans_id), we use it directly.
     * Otherwise we fall back to $reference (our merchant ref).
     */
    public function verify(string $reference, Business $business, ?string $providerTransactionId = null): VerificationResult
    {
        $token = $this->getAuthToken();
        $transId = $providerTransactionId ?? $reference;

        Log::info('[Junipay] Verify request', ['transId' => $transId, 'reference' => $reference]);

        $response = Http::withToken($token)
            ->withHeaders(['clientid' => $this->clientId])
            ->post(self::BASE_URL . '/checktranstatus', ['trans_id' => $transId]);

        Log::info('[Junipay] Verify response', [
            'status' => $response->status(),
            'body'   => $response->json(),
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
     * Return a short-lived bearer token for the Junipay Payment Form (JuniPop).
     * Used by CheckoutController::initiateJunipay() to pass to the frontend.
     * The secret never leaves the server — only this token is exposed.
     */
    public function getPaymentFormToken(): string
    {
        return $this->getAuthToken();
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
     * Obtain and cache a bearer token for the Junipay API.
     */
    private function getAuthToken(): string
    {
        $cacheKey = "junipay_token_{$this->clientId}";

        return Cache::remember($cacheKey, now()->addMinutes(50), function (): string {
            try {
                $response = Http::withHeaders(['xderd' => $this->secret])
                    ->get($this->tokenLink);

                Log::info('[Junipay] getAuthToken response', [
                    'status'    => $response->status(),
                    'token_url' => $this->tokenLink,
                    'body'      => $response->json(),
                ]);

                $response->throw();

                $token = $response->json('token') ?? $response->json('access_token') ?? '';

                if (empty($token)) {
                    throw new \RuntimeException(
                        '[Junipay] Token endpoint returned a 200 but no token field. Response: ' . $response->body()
                    );
                }

                return $token;
            } catch (\Throwable $e) {
                Log::error('[Junipay] getAuthToken failed', [
                    'token_url' => $this->tokenLink,
                    'error'     => $e->getMessage(),
                ]);

                throw $e;
            }
        });
    }
}
