<?php

namespace App\Services\Payments;

use App\Models\Business;
use App\Services\PaymentService;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

/**
 * Resolves the correct PaymentGateway implementation for a business.
 *
 * Decrypts credentials only within this factory scope — they never leave
 * the service layer or reach the frontend.
 */
class PaymentGatewayFactory
{
    /**
     * Build a gateway for the business's configured provider.
     *
     * @throws \RuntimeException if no provider is configured or keys are missing
     */
    public function make(Business $business): PaymentGateway
    {
        $provider = $business->default_payment_provider;

        if (! $provider) {
            throw new \RuntimeException('No payment provider configured for this business.');
        }

        return match ($provider) {
            PaymentService::PROVIDER_PAYSTACK => $this->makePaystack($business),
            PaymentService::PROVIDER_JUNIPAY  => $this->makeJunipay($business),
            default => throw new \RuntimeException("Unknown payment provider: {$provider}"),
        };
    }

    /**
     * Decrypt the secret key for a business provider directly from DB.
     * This bypasses the owner check in PaymentService since checkout
     * is initiated by customers, not the owner.
     */
    private function decryptSecret(Business $business, string $column): string
    {
        $cipherText = DB::table('businesses')
            ->where('id', $business->id)
            ->value($column);

        if (empty($cipherText)) {
            throw new \RuntimeException("No {$column} configured for business #{$business->id}.");
        }

        return Crypt::decryptString($cipherText);
    }

    private function makePaystack(Business $business): PaystackGateway
    {
        $secret = $this->decryptSecret($business, 'paystack_secret');

        return new PaystackGateway($secret);
    }

    private function makeJunipay(Business $business): JunipayGateway
    {
        $clientId = $business->junipay_client_id;

        if (empty($clientId)) {
            throw new \RuntimeException('Junipay client ID is not configured.');
        }

        $secret = $this->decryptSecret($business, 'junipay_secret');

        return new JunipayGateway($clientId, $secret);
    }
}
