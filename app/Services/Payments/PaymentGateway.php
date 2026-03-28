<?php

namespace App\Services\Payments;

use App\Models\Business;
use App\Models\Order;
use Illuminate\Http\Request;

interface PaymentGateway
{
    /**
     * Initialize a payment and return a redirect URL for the customer.
     */
    public function initialize(Order $order, Business $business, string $callbackUrl): InitializeResult;

    /**
     * Verify a payment by its reference and return the result.
     *
     * @param  string  $reference  Merchant reference (our payment_ref)
     * @param  string|null  $providerTransactionId  Provider's own txn id (e.g. Junipay trans_id) when available
     */
    public function verify(string $reference, Business $business, ?string $providerTransactionId = null): VerificationResult;

    /**
     * Verify that a webhook request was genuinely sent by the provider.
     */
    public function verifyWebhookSignature(Request $request, string $secret): bool;
}
