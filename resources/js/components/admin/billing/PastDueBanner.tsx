import { Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowRight, CreditCard, Wallet } from 'lucide-react';
import { useState } from 'react';
import { manage as manageRoute, show as billingShowRoute } from '@/routes/businesses/billing';
import { useSubscriptionCheckout } from '@/hooks/use-subscription-checkout';
import { useTier } from '@/hooks/use-tier';

/**
 * Renders on the Billing page when the active business is past_due.
 * Two CTAs that mean different things:
 *   - Update card → Paystack manage portal (Paystack retries on the
 *     existing subscription via charge.success).
 *   - Pay now to restore → manual one-month bridge (back-end disables
 *     the old Paystack sub during activation).
 */
export function PastDueBanner() {
    const business = usePage().props.business;
    const { current } = useTier();
    const { start, pending, isReady } = useSubscriptionCheckout();
    const [managePending, setManagePending] = useState(false);

    if (!business || !isReady || !current || current === 'free') {
        return null;
    }

    const handleManage = (): void => {
        setManagePending(true);
        router.post(
            manageRoute({ business: business.slug }).url,
            {},
            {
                preserveScroll: true,
                onError: () => setManagePending(false),
                onFinish: () => setManagePending(false),
            },
        );
    };

    const handlePayNow = (): void => start(current, 'manual');

    return (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-red-900">Your last renewal payment failed</p>
                    <p className="mt-1 text-sm text-red-800">
                        You still have access. Update your card to keep your plan auto-renewing, or pay now for a one-month bridge with momo or bank.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleManage}
                            disabled={managePending}
                            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                            <CreditCard className="h-4 w-4" />
                            {managePending ? 'Opening portal' : 'Update card'}
                        </button>

                        <button
                            type="button"
                            onClick={handlePayNow}
                            disabled={pending !== null}
                            className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                        >
                            <Wallet className="h-4 w-4" />
                            {pending ? 'Redirecting' : 'Pay now to restore'}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

/**
 * Compact variant for the dashboard. Each past_due business gets one row
 * with a single "Restore" link that lands them on the per-business billing
 * page where the full banner's two CTAs are available.
 */
export function DashboardPastDueBanner({ businesses }: { businesses: Array<{ id: number; name: string; slug: string }> }) {
    if (businesses.length === 0) {
        return null;
    }

    return (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-red-900">
                        {businesses.length === 1
                            ? `${businesses[0].name} has a past-due subscription`
                            : `${businesses.length} businesses have past-due subscriptions`}
                    </p>
                    <ul className="mt-3 space-y-2">
                        {businesses.map((b) => (
                            <li key={b.id}>
                                <Link
                                    href={billingShowRoute({ business: b.slug }).url}
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 hover:underline"
                                >
                                    Restore {b.name}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
