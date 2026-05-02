import { Link, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowUpRight } from 'lucide-react';
import { show as billingShowRoute } from '@/routes/businesses/billing';
import { formatShortDate } from '@/lib/utils';
import { useSubscriptionCheckout } from '@/hooks/use-subscription-checkout';
import { useTier } from '@/hooks/use-tier';

const REMINDER_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

type Flavour = {
    tone: 'red' | 'amber';
    title: string;
    body: string;
    cta: { kind: 'link'; label: string; href: string } | { kind: 'renew'; label: string };
};

export function OverviewBillingBanner() {
    const business = usePage().props.business;
    const { tier, current } = useTier();
    const { start, pending } = useSubscriptionCheckout();

    if (!business || !tier || !current || current === 'free') {
        return null;
    }

    const billingHref = billingShowRoute({ business: business.slug }).url;
    const flavour = pickFlavour(tier, billingHref);
    if (!flavour) return null;

    const palette =
        flavour.tone === 'red'
            ? {
                  wrap: 'border-red-200 bg-red-50',
                  icon: 'text-red-600',
                  title: 'text-red-900',
                  body: 'text-red-800',
                  cta: 'bg-red-600 text-white hover:bg-red-700',
              }
            : {
                  wrap: 'border-amber-200 bg-amber-50',
                  icon: 'text-amber-600',
                  title: 'text-amber-900',
                  body: 'text-amber-800',
                  cta: 'bg-amber-600 text-white hover:bg-amber-700',
              };

    const ctaClass = `inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-60 ${palette.cta}`;

    return (
        <section className={`mb-6 rounded-2xl border px-5 py-4 ${palette.wrap}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className={`mt-0.5 h-5 w-5 shrink-0 ${palette.icon}`} />
                    <div className="min-w-0">
                        <p className={`text-sm font-semibold ${palette.title}`}>{flavour.title}</p>
                        <p className={`mt-0.5 text-sm ${palette.body}`}>{flavour.body}</p>
                    </div>
                </div>

                {flavour.cta.kind === 'link' ? (
                    <Link href={flavour.cta.href} className={ctaClass}>
                        {flavour.cta.label}
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={() => start(current, 'manual')}
                        disabled={pending !== null}
                        className={ctaClass}
                    >
                        {pending ? 'Redirecting' : flavour.cta.label}
                        <ArrowUpRight className="h-4 w-4" />
                    </button>
                )}
            </div>
        </section>
    );
}

function pickFlavour(
    tier: NonNullable<ReturnType<typeof useTier>['tier']>,
    billingHref: string,
): Flavour | null {
    if (tier.subscription_status === 'past_due') {
        return {
            tone: 'red',
            title: 'Payment past due',
            body: 'Your subscription payment failed. Restore your plan to avoid service interruption.',
            cta: { kind: 'link', label: 'Restore plan', href: billingHref },
        };
    }

    // Manual lane = active sub with no card auto-renew. auto_renew is the
    // shared-prop signal Inertia ships for "Paystack drives renewal".
    const isManualLane = tier.subscription_status === 'active' && !tier.auto_renew;
    const periodEnd = tier.current_period_end ? new Date(tier.current_period_end) : null;
    if (!isManualLane || !periodEnd) return null;

    const msUntilExpiry = periodEnd.getTime() - Date.now();

    if (msUntilExpiry <= 0) {
        return {
            tone: 'red',
            title: 'Plan expired',
            body: `Your ${tier.label} plan has ended. Renew now to keep your features.`,
            cta: { kind: 'renew', label: 'Renew now' },
        };
    }

    if (msUntilExpiry <= REMINDER_WINDOW_MS) {
        return {
            tone: 'amber',
            title: 'Plan expires soon',
            body: `Your ${tier.label} plan expires on ${formatShortDate(tier.current_period_end)}. Renew to avoid interruption.`,
            cta: { kind: 'renew', label: 'Renew now' },
        };
    }

    return null;
}
