import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { checkout as checkoutRoute } from '@/routes/businesses/billing';
import type { SubscriptionTier } from '@/types';

export type CheckoutMode = 'auto' | 'manual';

/**
 * Single entry point for "buy a plan" buttons across the app: the upgrade
 * modal, the pricing page CTAs, the billing page Change-plan button, and
 * the past-due banner all funnel through here. Posts to billing.checkout,
 * which creates a pending invoice and redirects the browser to Paystack
 * via Inertia::location.
 *
 * `mode=auto` initializes Paystack with a plan code (card auto-renew).
 * `mode=manual` initializes without a plan (any channel, manual renewal).
 *
 * Exposes a `pending` tier so each button can show its own spinner without
 * the others flashing.
 */
export function useSubscriptionCheckout() {
    const business = usePage().props.business;
    const [pending, setPending] = useState<SubscriptionTier | null>(null);

    const start = (target: SubscriptionTier, mode: CheckoutMode): void => {
        if (!business) return;
        if (pending) return;

        setPending(target);
        router.post(
            checkoutRoute({ business: business.slug }).url,
            { target, mode },
            {
                preserveScroll: true,
                onError: () => setPending(null),
                onFinish: () => setPending(null),
            },
        );
    };

    return { start, pending, isReady: business !== null };
}
