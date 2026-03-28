<?php

namespace App\Services;

use App\Models\Business;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

/**
 * Manages payment provider credentials with AES-256 encryption.
 *
 * Security contract:
 *   - Keys are NEVER stored in plaintext
 *   - Keys are NEVER returned to the frontend
 *   - Keys are NEVER logged
 *   - Decryption happens only within a single method call scope
 *   - Only the business owner can read or write keys
 */
class PaymentService
{
    public const PROVIDER_PAYSTACK = 'paystack';

    public const PROVIDER_JUNIPAY = 'junipay';

    /**
     * Encrypt and persist a payment provider API key.
     *
     * @throws AuthorizationException if user is not the business owner
     */
    public function storeKey(Business $business, string $provider, string $plainKey, User $user): void
    {
        $plainKey = trim($plainKey);

        if (empty($plainKey)) {
            throw new \InvalidArgumentException('Payment key must not be empty.');
        }

        $this->assertOwner($business, $user);

        $column = $this->columnFor($provider);

        // Write directly via DB to bypass $fillable — payment columns are intentionally
        // excluded from mass assignment to prevent accidental plaintext writes.
        DB::table('businesses')
            ->where('id', $business->id)
            ->update([$column => Crypt::encryptString($plainKey)]);

        if ($provider === self::PROVIDER_JUNIPAY) {
            $this->forgetJunipayTokenCache($business->junipay_client_id);
        }
    }

    /**
     * Decrypt a payment key and return it for use within a single request.
     *
     * The caller is responsible for using the key and discarding it.
     * Never assign the return value to a property, log it, or return it in a response.
     *
     * @throws AuthorizationException if user is not the business owner
     */
    public function decryptKey(Business $business, string $provider, User $user): string
    {
        $this->assertOwner($business, $user);

        $column = $this->columnFor($provider);
        $cipherText = $business->getRawOriginal($column)
            ?? DB::table('businesses')->where('id', $business->id)->value($column);

        if (empty($cipherText)) {
            throw new \RuntimeException("No {$provider} key configured for this business.");
        }

        return Crypt::decryptString($cipherText);
        // Caller must use and discard — this string must never leave the service layer
    }

    /**
     * Persist Junipay plain-text credentials (client ID + token link).
     * Neither is a secret — both are stored as plain text.
     *
     * @throws \InvalidArgumentException if clientId or tokenLink are blank / invalid
     * @throws AuthorizationException    if user is not the business owner
     */
    public function storeJunipayMeta(Business $business, string $clientId, string $tokenLink, User $user): void
    {
        $clientId  = trim($clientId);
        $tokenLink = trim($tokenLink);

        if (empty($clientId)) {
            throw new \InvalidArgumentException('Junipay client ID must not be empty.');
        }

        if (empty($tokenLink) || ! filter_var($tokenLink, FILTER_VALIDATE_URL)) {
            throw new \InvalidArgumentException('Junipay token link must be a valid URL.');
        }

        $this->assertOwner($business, $user);

        DB::table('businesses')
            ->where('id', $business->id)
            ->update([
                'junipay_client_id'  => $clientId,
                'junipay_token_link' => $tokenLink,
            ]);

        $this->forgetJunipayTokenCache($clientId);
    }

    /**
     * Remove a stored payment key (and client ID for Junipay).
     *
     * @throws AuthorizationException if user is not the business owner
     */
    public function removeKey(Business $business, string $provider, User $user): void
    {
        $this->assertOwner($business, $user);

        $updates = [$this->columnFor($provider) => null];

        if ($provider === self::PROVIDER_JUNIPAY) {
            $updates['junipay_client_id']  = null;
            $updates['junipay_token_link'] = null;
        }

        DB::table('businesses')
            ->where('id', $business->id)
            ->update($updates);

        if ($provider === self::PROVIDER_JUNIPAY && $business->junipay_client_id) {
            $this->forgetJunipayTokenCache($business->junipay_client_id);
        }
    }

    /**
     * Check if a provider key is configured (without decrypting).
     */
    public function hasKey(Business $business, string $provider): bool
    {
        return match ($provider) {
            self::PROVIDER_PAYSTACK => $business->hasPaystackConfigured(),
            self::PROVIDER_JUNIPAY => $business->hasJunipayConfigured(),
            default => false,
        };
    }

    // -------------------------------------------------------------------------
    // Private
    // -------------------------------------------------------------------------

    private function assertOwner(Business $business, User $user): void
    {
        if (! $business->isOwnedBy($user)) {
            throw new AuthorizationException(
                'Only the business owner can manage payment credentials.'
            );
        }
    }

    private function forgetJunipayTokenCache(?string $clientId): void
    {
        if ($clientId) {
            Cache::forget("junipay_token_{$clientId}");
        }
    }

    private function columnFor(string $provider): string
    {
        return match ($provider) {
            self::PROVIDER_PAYSTACK => 'paystack_secret',
            self::PROVIDER_JUNIPAY => 'junipay_secret',
            default => throw new \InvalidArgumentException(
                "Unknown payment provider: {$provider}"
            ),
        };
    }
}
