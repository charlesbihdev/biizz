import { usePage } from '@inertiajs/react';
import type { AuthenticatedCustomer, CustomerLoginMode } from '@/types/business';

export interface CustomerAuthState {
    /** The logged-in customer, or null if not authenticated */
    customer:        AuthenticatedCustomer | null;
    /** Whether a customer is currently logged in */
    isAuthenticated: boolean;
    /**
     * The business's login policy:
     *   'none'     → fully public, login is optional
     *   'checkout' → must log in before checkout (default)
     *   'full'     → entire store gated behind login
     */
    loginMode:       CustomerLoginMode;
    /** Convenience: true when loginMode is 'full' and customer is not logged in */
    isBlocked:       boolean;
    /** Convenience: true when loginMode is 'checkout' or 'full' and not logged in */
    requiresLoginForCheckout: boolean;
}

/**
 * Shared hook for customer authentication state.
 *
 * Lives in Themes/Shared — themes call this hook and decide how to
 * enforce the loginMode in their own UI. The hook never renders anything.
 *
 * Usage:
 *   const { customer, isAuthenticated, loginMode, isBlocked } = useCustomerAuth();
 */
export function useCustomerAuth(): CustomerAuthState {
    const { auth, business } = usePage().props as {
        auth:     { customer?: AuthenticatedCustomer | null };
        business: { customer_login_mode?: CustomerLoginMode } | null;
    };

    const customer        = auth?.customer ?? null;
    const isAuthenticated = customer !== null;
    const loginMode       = business?.customer_login_mode ?? 'checkout';

    return {
        customer,
        isAuthenticated,
        loginMode,
        isBlocked:                loginMode === 'full' && !isAuthenticated,
        requiresLoginForCheckout: (loginMode === 'checkout' || loginMode === 'full') && !isAuthenticated,
    };
}
