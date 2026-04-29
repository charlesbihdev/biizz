<?php

namespace App\Auth;

use App\Services\BusinessContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Enforces single-identity sessions and resolves the active guard for a route.
 *
 * The app has three separate authentication identities (web/admin,
 * customer/storefront, buyer/marketplace) and each guard stores its login
 * in its own key inside the same session. Without intervention a single
 * browser can hold all three at once, which leaks identity into the wrong
 * UI surface. clearOtherGuards() is called from the Login event listener
 * so that a fresh login on any guard atomically signs the visitor out of
 * every other guard. guardForRoute() is the single source of truth for
 * "which identity is this URL about" used by both the guest-redirect and
 * the Inertia shared props.
 */
class AuthIntent
{
    /** @var list<string> */
    public const GUARDS = ['web', 'customer', 'buyer'];

    public static function clearOtherGuards(string $keepGuard): void
    {
        foreach (self::GUARDS as $guard) {
            if ($guard === $keepGuard) {
                continue;
            }

            $authGuard = Auth::guard($guard);

            // Probe the session directly instead of calling check() — check()
            // resolves the user via the guard's provider, which for the
            // customer guard needs BusinessContext and would throw on the
            // admin login page. session()->has() is cheap and side-effect-free.
            if (! method_exists($authGuard, 'getName') || ! session()->has($authGuard->getName())) {
                continue;
            }

            $authGuard->logout();
        }
    }

    /**
     * Resolve which guard the current route belongs to.
     *
     * Marketplace and creator-catalog routes are buyer-context. Routes that
     * had ResolveBusiness applied are customer-context. Everything else is
     * admin (web). Used by guest redirects and Inertia shared props so the
     * two stay in lockstep.
     */
    public static function guardForRoute(Request $request): string
    {
        $name = $request->route()?->getName() ?? '';

        if (str_starts_with($name, 'marketplace.') || str_starts_with($name, 'catalog.')) {
            return 'buyer';
        }

        if (BusinessContext::isSet()) {
            return 'customer';
        }

        return 'web';
    }
}
