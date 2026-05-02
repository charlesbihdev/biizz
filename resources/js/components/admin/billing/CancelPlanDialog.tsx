import { router, usePage } from '@inertiajs/react';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { cancel as cancelRoute } from '@/routes/businesses/billing';
import { useTier } from '@/hooks/use-tier';
import { formatShortDate } from '@/lib/utils';

/**
 * Two-step cancel: a small "Cancel plan" button that opens a centred
 * confirm sheet explaining that access continues until current_period_end.
 * Keeps the user calm — the worst outcome of misclicking is a dialog they
 * can dismiss.
 */
export function CancelPlanDialog() {
    const business = usePage().props.business;
    const { tier } = useTier();
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    if (!business || !tier) return null;

    const handleCancel = (): void => {
        setSubmitting(true);
        router.post(
            cancelRoute({ business: business.slug }).url,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setSubmitting(false);
                    setOpen(false);
                },
            },
        );
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-site-border bg-white px-4 py-2 text-xs font-semibold text-site-muted transition hover:bg-site-surface hover:text-site-fg"
            >
                Cancel plan
            </button>

            {open && (
                <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={() => setOpen(false)}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Close"
                            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-site-muted transition hover:bg-site-surface hover:text-site-fg"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-site-fg">Cancel your {tier.label} plan?</h3>
                        <p className="mt-2 text-sm text-site-muted">
                            You&rsquo;ll keep {tier.label} until <strong>{formatShortDate(tier.current_period_end)}</strong>,
                            then your store moves back to Free. No refund, no surprise charges. You can resume anytime
                            before that date.
                        </p>

                        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={submitting}
                                className="inline-flex items-center justify-center rounded-full border border-site-border bg-white px-4 py-2 text-sm font-semibold text-site-fg transition hover:bg-site-surface disabled:opacity-60"
                            >
                                Keep my plan
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={submitting}
                                className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                            >
                                {submitting ? 'Cancelling' : 'Cancel at period end'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
