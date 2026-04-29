<?php

namespace App\Auth;

use App\Models\Customer;
use App\Models\Scopes\BusinessScope;
use App\Services\BusinessContext;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Support\Facades\Hash;

/**
 * Custom auth provider for storefront customers.
 *
 * Customers are scoped per-business — the same email address can exist
 * in two different stores as two separate customer accounts. This provider
 * resolves credentials by (business_id, email) instead of email alone.
 *
 * It uses withoutGlobalScope(BusinessScope::class) internally so that the
 * BusinessScope doesn't interfere with auth resolution, but BusinessContext
 * is always set by the ResolveBusiness middleware before this runs.
 */
class CustomerUserProvider implements UserProvider
{
    public function retrieveById($identifier): ?Authenticatable
    {
        // Customer identity is per-business. Outside a storefront request the
        // customer guard has no business to scope to, so it is treated as not
        // authenticated rather than throwing — admin pages and other guards
        // routinely probe this guard during their own auth flow.
        if (! BusinessContext::isSet()) {
            return null;
        }

        return Customer::withoutGlobalScope(BusinessScope::class)
            ->where('id', $identifier)
            ->where('business_id', BusinessContext::current()->id)
            ->first();
    }

    public function retrieveByToken($identifier, #[\SensitiveParameter] $token): ?Authenticatable
    {
        if (! BusinessContext::isSet()) {
            return null;
        }

        return Customer::withoutGlobalScope(BusinessScope::class)
            ->where('id', $identifier)
            ->where('business_id', BusinessContext::current()->id)
            ->where('remember_token', $token)
            ->first();
    }

    public function updateRememberToken(Authenticatable $user, #[\SensitiveParameter] $token): void
    {
        /** @var Customer $user */
        $user->setRememberToken($token);
        $user->save();
    }

    public function retrieveByCredentials(#[\SensitiveParameter] array $credentials): ?Authenticatable
    {
        if (! BusinessContext::isSet()) {
            return null;
        }

        return Customer::withoutGlobalScope(BusinessScope::class)
            ->where('business_id', BusinessContext::current()->id)
            ->where('email', $credentials['email'])
            ->first();
    }

    public function validateCredentials(Authenticatable $user, #[\SensitiveParameter] array $credentials): bool
    {
        return Hash::check($credentials['password'], $user->getAuthPassword());
    }

    public function rehashPasswordIfRequired(Authenticatable $user, #[\SensitiveParameter] array $credentials, bool $force = false): void
    {
        if (! Hash::needsRehash($user->getAuthPassword()) && ! $force) {
            return;
        }

        /** @var Customer $user */
        $user->forceFill(['password' => Hash::make($credentials['password'])])->save();
    }
}
