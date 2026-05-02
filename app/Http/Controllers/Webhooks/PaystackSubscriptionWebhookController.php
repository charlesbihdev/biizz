<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\SubscriptionInvoice;
use App\Services\Payments\PaystackGateway;
use App\Services\Payments\VerificationResult;
use App\Services\Subscription\SubscriptionActivation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Server-to-server endpoint Paystack hits for subscription lifecycle
 * events. Always 2xx unless the signature is invalid — Paystack will keep
 * retrying anything else, and we'd rather acknowledge unknown events than
 * trigger storms.
 */
class PaystackSubscriptionWebhookController extends Controller
{
    public function __construct(
        private readonly PaystackGateway $gateway,
        private readonly SubscriptionActivation $activation,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $secret = (string) config('services.paystack.secret');

        if (! $this->gateway->verifyWebhookSignature($request, $secret)) {
            Log::warning('Subscription webhook: invalid signature', ['ip' => $request->ip()]);

            return response()->json(['status' => 'invalid signature'], 400);
        }

        $event = (string) $request->input('event', '');
        $data = (array) $request->input('data', []);

        try {
            match ($event) {
                'charge.success' => $this->handleChargeSuccess($data),
                'subscription.create' => $this->handleSubscriptionCreate($data),
                'invoice.create', 'invoice.update' => $this->handleInvoiceUpsert($data),
                'invoice.payment_failed' => $this->handleInvoiceFailed($data),
                'subscription.disable', 'subscription.not_renew' => $this->handleSubscriptionDisable($data),
                default => null,
            };
        } catch (Throwable $e) {
            Log::error('Subscription webhook handler failed', [
                'event' => $event,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json(['status' => 'ok'], 200);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function handleChargeSuccess(array $data): void
    {
        $reference = (string) ($data['reference'] ?? '');
        if ($reference === '') {
            return;
        }

        $invoice = SubscriptionInvoice::query()->where('reference', $reference)->first();
        if (! $invoice) {
            return;
        }

        $result = new VerificationResult(
            successful: true,
            reference: $reference,
            transactionId: (string) ($data['id'] ?? ''),
            amountInMinorUnit: (int) ($data['amount'] ?? 0),
            currency: (string) ($data['currency'] ?? 'GHS'),
            metadata: [
                'customer' => (array) ($data['customer'] ?? []),
                'authorization' => (array) ($data['authorization'] ?? []),
            ],
        );

        $this->activation->activate($reference, $result);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function handleSubscriptionCreate(array $data): void
    {
        $email = $data['customer']['email'] ?? null;
        $code = $data['subscription_code'] ?? null;
        $token = $data['email_token'] ?? null;
        $customerCode = $data['customer']['customer_code'] ?? null;

        if (! is_string($email) || ! is_string($code) || ! is_string($token)) {
            return;
        }

        $business = $this->resolveBusinessByEmail($email);
        if (! $business) {
            return;
        }

        $business->update(array_filter([
            'subscription_gateway' => 'paystack',
            'subscription_id' => $code,
            'paystack_email_token' => $token,
            'subscription_customer_id' => is_string($customerCode) ? $customerCode : null,
            'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
        ], static fn ($v) => $v !== null));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function handleInvoiceUpsert(array $data): void
    {
        $invoiceId = $data['invoice_code'] ?? null;
        $subscriptionId = $data['subscription']['subscription_code'] ?? null;
        $amount = (int) ($data['amount'] ?? 0);
        $reference = $data['transaction']['reference'] ?? null;

        if (! is_string($invoiceId) || ! is_string($subscriptionId)) {
            return;
        }

        $business = Business::query()
            ->where('subscription_id', $subscriptionId)
            ->first();
        if (! $business) {
            return;
        }

        SubscriptionInvoice::query()->updateOrCreate(
            ['gateway_invoice_id' => $invoiceId],
            [
                'business_id' => $business->id,
                'tier' => $business->subscription_tier->value,
                'gateway' => 'paystack',
                'reference' => is_string($reference) && $reference !== '' ? $reference : 'pi_'.$invoiceId,
                'amount' => $amount / 100,
                'currency' => (string) ($data['currency'] ?? 'GHS'),
                'status' => SubscriptionInvoice::STATUS_PENDING,
            ],
        );
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function handleInvoiceFailed(array $data): void
    {
        $invoiceId = $data['invoice_code'] ?? null;
        $subscriptionId = $data['subscription']['subscription_code'] ?? null;

        if (! is_string($invoiceId)) {
            return;
        }

        SubscriptionInvoice::query()
            ->where('gateway_invoice_id', $invoiceId)
            ->update(['status' => SubscriptionInvoice::STATUS_FAILED]);

        if (is_string($subscriptionId)) {
            Business::query()
                ->where('subscription_id', $subscriptionId)
                ->update(['subscription_status' => Business::SUBSCRIPTION_STATUS_PAST_DUE]);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function handleSubscriptionDisable(array $data): void
    {
        $subscriptionId = $data['subscription_code'] ?? null;
        if (! is_string($subscriptionId)) {
            return;
        }

        Business::query()
            ->where('subscription_id', $subscriptionId)
            ->update(['subscription_status' => Business::SUBSCRIPTION_STATUS_CANCELED]);
    }

    private function resolveBusinessByEmail(string $email): ?Business
    {
        return Business::query()
            ->whereHas('owner', fn ($q) => $q->where('email', $email))
            ->latest('id')
            ->first();
    }
}
