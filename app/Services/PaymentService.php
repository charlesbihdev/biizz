<?php

namespace App\Services;

use App\Models\Business;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
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
    public const PROVIDER_JUNIPAY  = 'junipay';

    /**
     * Encrypt and persist a payment provider API key.
     *
     * @throws AuthorizationException if user is not the business owner
     */
    public function storeKey(Business $business, string $provider, string $plainKey, User $user): void
    {
        $this->assertOwner($business, $user);

        $column = $this->columnFor($provider);

        // Write directly via DB to bypass $fillable — payment columns are intentionally
        // excluded from mass assignment to prevent accidental plaintext writes.
        DB::table('businesses')
            ->where('id', $business->id)
            ->update([$column => Crypt::encryptString($plainKey)]);
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

        $column     = $this->columnFor($provider);
        $cipherText = $business->getRawOriginal($column)
            ?? DB::table('businesses')->where('id', $business->id)->value($column);

        if (empty($cipherText)) {
            throw new \RuntimeException("No {$provider} key configured for this business.");
        }

        return Crypt::decryptString($cipherText);
        // Caller must use and discard — this string must never leave the service layer
    }

    /**
     * Remove a stored payment key.
     *
     * @throws AuthorizationException if user is not the business owner
     */
    public function removeKey(Business $business, string $provider, User $user): void
    {
        $this->assertOwner($business, $user);

        DB::table('businesses')
            ->where('id', $business->id)
            ->update([$this->columnFor($provider) => null]);
    }

    /**
     * Check if a provider key is configured (without decrypting).
     */
    public function hasKey(Business $business, string $provider): bool
    {
        return match ($provider) {
            self::PROVIDER_PAYSTACK => $business->hasPaystackConfigured(),
            self::PROVIDER_JUNIPAY  => $business->hasJunipayConfigured(),
            default                 => false,
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

    private function columnFor(string $provider): string
    {
        return match ($provider) {
            self::PROVIDER_PAYSTACK => 'paystack_secret',
            self::PROVIDER_JUNIPAY  => 'junipay_secret',
            default                 => throw new \InvalidArgumentException(
                "Unknown payment provider: {$provider}"
            ),
        };
    }
}
