import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Loader2, Wallet } from 'lucide-react';
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
 *  - Signed in with at least one business:   pick a payment method (card
 *    auto-renew or momo/bank manual), then POST to billing.checkout for
 *    that business — Paystack redirects from there.
 *
 * Uses Wayfinder helpers throughout so route changes propagate without
 * grepping for string URLs.
 */
export function PlanCTA({ tier, label, isPro }: Props) {
    const { auth, businesses } = usePage().props;
    const [pendingMode, setPendingMode] = useState<'auto' | 'manual' | null>(null);
    const [picking, setPicking] = useState(false);

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

    const submit = (mode: 'auto' | 'manual'): void => {
        if (pendingMode) return;
        setPendingMode(mode);
        router.post(
            checkoutRoute({ business: target.slug }).url,
            { target: tier, mode },
            {
                preserveScroll: true,
                onError: () => setPendingMode(null),
                onFinish: () => setPendingMode(null),
            },
        );
    };

    if (!picking) {
        return (
            <button type="button" onClick={() => setPicking(true)} className={baseClass}>
                Choose {label}
            </button>
        );
    }

    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={() => submit('auto')}
                disabled={pendingMode !== null}
                className={cn(baseClass, 'flex items-center justify-center gap-2')}
            >
                {pendingMode === 'auto' ? (
                    <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Redirecting
                    </>
                ) : (
                    <>
                        <CreditCard className="h-3.5 w-3.5" />
                        Pay with card · auto-renew
                    </>
                )}
            </button>

            <button
                type="button"
                onClick={() => submit('manual')}
                disabled={pendingMode !== null}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-site-border bg-white px-5 py-2.5 text-center text-sm font-bold text-site-fg transition hover:bg-site-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
                {pendingMode === 'manual' ? (
                    <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Redirecting
                    </>
                ) : (
                    <>
                        <Wallet className="h-3.5 w-3.5" />
                        Pay with momo or bank
                    </>
                )}
            </button>

            <button
                type="button"
                onClick={() => setPicking(false)}
                disabled={pendingMode !== null}
                className="inline-flex items-center gap-1 text-xs font-semibold text-site-muted transition hover:text-site-fg disabled:opacity-60"
            >
                <ArrowLeft className="h-3 w-3" />
                Back
            </button>
        </div>
    );
}
