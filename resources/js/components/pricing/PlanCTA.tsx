import { Link, router, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { checkout as checkoutRoute } from '@/routes/businesses/billing';
import { create as createBusinessRoute } from '@/routes/businesses';
import { register } from '@/routes';
import { cn } from '@/lib/utils';
import type { SubscriptionTier } from '@/types';

interface Props {
    tier: SubscriptionTier;
    label: string;
    isPro: boolean;
}

/**
 * Plan card CTA on the public /pricing page. Three states:
 *  - Visitor not signed in:                  Link to /register.
 *  - Signed in, no business yet:             Link to "create business" wizard.
 *  - Signed in with at least one business:   POST to that business's
 *    billing.checkout endpoint, which redirects to Paystack.
 *
 * Uses Wayfinder helpers throughout so route changes propagate without
 * grepping for string URLs.
 */
export function PlanCTA({ tier, label, isPro }: Props) {
    const { auth, businesses } = usePage().props;
    const [submitting, setSubmitting] = useState(false);

    const baseClass = cn(
        'block w-full rounded-full px-5 py-2.5 text-center text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60',
        isPro ? 'bg-brand text-white hover:bg-brand-hover' : 'bg-site-fg text-white hover:bg-site-fg/90',
    );

    if (tier === 'free') {
        return (
            <Link
                href={register().url}
                className="block w-full rounded-full border border-site-border bg-white px-5 py-2.5 text-center text-sm font-bold text-site-fg transition hover:bg-site-surface"
            >
                Start for free
            </Link>
        );
    }

    if (!auth.user) {
        return (
            <Link href={register().url} className={baseClass}>
                Sign up to choose {label}
            </Link>
        );
    }

    if (businesses.length === 0) {
        return (
            <Link href={createBusinessRoute().url} className={baseClass}>
                Create a business to start
            </Link>
        );
    }

    const target = businesses[0];

    const handleClick = (): void => {
        if (submitting) return;
        setSubmitting(true);
        router.post(
            checkoutRoute({ business: target.slug }).url,
            { target: tier },
            {
                preserveScroll: true,
                onError: () => setSubmitting(false),
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <button type="button" onClick={handleClick} disabled={submitting} className={baseClass}>
            {submitting ? (
                <span className="inline-flex items-center justify-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Redirecting
                </span>
            ) : (
                `Choose ${label}`
            )}
        </button>
    );
}
