import { router, usePage } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { checkout as checkoutRoute } from '@/routes/businesses/billing';
import { formatShortDate } from '@/lib/utils';
import type { SubscriptionStatus, SubscriptionTier, TierMeta } from '@/types';
import { UpgradeButton } from './UpgradeButton';

const REMINDER_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

interface Props {
    current: SubscriptionTier;
    label: string;
    meta: TierMeta | null;
    status: SubscriptionStatus;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    autoRenew: boolean;
}

export function CurrentPlanCard({ current, label, status, currentPeriodEnd, cancelAtPeriodEnd, autoRenew }: Props) {
    const isFree = current === 'free';

    return (
        <section className="flex flex-wrap items-start justify-between gap-4 border-b border-site-border pb-8">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-site-surface">
                    <Sparkles className="h-5 w-5 text-site-muted" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-site-fg">{label} plan</h2>
                    {!isFree && <p className="mt-0.5 text-sm text-site-muted">Monthly</p>}
                    <PlanStatus
                        isFree={isFree}
                        status={status}
                        renewsOn={currentPeriodEnd}
                        cancelAtPeriodEnd={cancelAtPeriodEnd}
                        autoRenew={autoRenew}
                        target={current}
                    />
                </div>
            </div>

            {isFree && <UpgradeButton target="pro" label="Upgrade to Pro" />}
        </section>
    );
}

function PlanStatus({
    isFree,
    status,
    renewsOn,
    cancelAtPeriodEnd,
    autoRenew,
    target,
}: {
    isFree: boolean;
    status: SubscriptionStatus;
    renewsOn: string | null;
    cancelAtPeriodEnd: boolean;
    autoRenew: boolean;
    target: SubscriptionTier;
}) {
    if (isFree) {
        return (
            <p className="mt-1 max-w-md text-sm text-site-muted">
                Upgrade to unlock unlimited products, deeper analytics, and remove biizz branding from your storefront.
            </p>
        );
    }

    // 1. past_due — keep the body clean, the PastDueBanner above carries the urgency.
    if (status === 'past_due') {
        return (
            <p className="mt-1 text-sm font-semibold text-red-600">
                Past due
            </p>
        );
    }

    // 2 + 3. cancel_at_period_end — same amber pill before and during grace.
    if (cancelAtPeriodEnd) {
        const periodPassed = renewsOn ? new Date(renewsOn).getTime() < Date.now() : false;
        return (
            <p className="mt-1 text-sm text-amber-600">
                {periodPassed
                    ? `Ended on ${formatShortDate(renewsOn)}`
                    : `Ends on ${formatShortDate(renewsOn)}`}
            </p>
        );
    }

    // 4. auto-renew (card subscription, healthy)
    if (autoRenew) {
        return (
            <p className="mt-1 text-sm text-site-muted">
                Renews on {formatShortDate(renewsOn)}.
            </p>
        );
    }

    // 5 + 6. manual lane (no Paystack subscription).
    const msUntilExpiry = renewsOn ? new Date(renewsOn).getTime() - Date.now() : null;
    const expired = msUntilExpiry !== null && msUntilExpiry <= 0;
    const closeToExpiry = msUntilExpiry !== null && msUntilExpiry > 0 && msUntilExpiry <= REMINDER_WINDOW_MS;

    if (expired) {
        return (
            <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-700">
                    Expired
                </span>
                <ManualCheckoutButton target={target} label="Renew now" />
            </div>
        );
    }

    if (closeToExpiry) {
        return (
            <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-700">
                    Expires soon
                </span>
                <ManualCheckoutButton target={target} label="Renew now" />
            </div>
        );
    }

    return (
        <p className="mt-1 text-sm text-site-muted">
            Expires on {formatShortDate(renewsOn)}. <ManualCheckoutButton target={target} label="Extend" inline />
        </p>
    );
}

function ManualCheckoutButton({
    target,
    label,
    inline = false,
}: {
    target: SubscriptionTier;
    label: string;
    inline?: boolean;
}) {
    const business = usePage().props.business;
    const [pending, setPending] = useState(false);

    if (!business) return null;

    const handleClick = (): void => {
        setPending(true);
        router.post(
            checkoutRoute({ business: business.slug }).url,
            { target, mode: 'manual' },
            {
                preserveScroll: true,
                onError: () => setPending(false),
                onFinish: () => setPending(false),
            },
        );
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={pending}
            className={
                inline
                    ? 'font-semibold text-brand hover:underline disabled:opacity-60'
                    : 'inline-flex items-center justify-center rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60'
            }
        >
            {pending ? 'Redirecting' : label}
        </button>
    );
}
