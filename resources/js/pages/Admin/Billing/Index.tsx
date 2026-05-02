import { LifeBuoy } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { CancelPlanDialog } from '@/components/admin/billing/CancelPlanDialog';
import { CurrentPlanCard } from '@/components/admin/billing/CurrentPlanCard';
import { InvoicesList } from '@/components/admin/billing/InvoicesList';
import { PastDueBanner } from '@/components/admin/billing/PastDueBanner';
import { useTier } from '@/hooks/use-tier';
import { show as businessShow } from '@/routes/businesses';
import type { Business, SubscriptionInvoice } from '@/types';

type Props = {
    business: Business;
    invoices: SubscriptionInvoice[];
};

export default function BillingIndex({ business, invoices }: Props) {
    const { tier, current, label, tierMeta } = useTier();

    if (!tier || !current) return null;

    const isFree = current === 'free';
    const isPastDue = tier.subscription_status === 'past_due';
    // Manual subs lapse on their own; auto-renew subs already cancelling
    // shouldn't be cancelled twice. Past-due users recover via the banner,
    // not the cancel section.
    const showCancel = !isFree && tier.auto_renew && !tier.cancel_at_period_end && !isPastDue;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: businessShow({ business: business.slug }).url },
                { title: 'Billing', href: '#' },
            ]}
        >
            <div className="p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-xl font-bold text-site-fg">Billing</h1>
                    <p className="mt-0.5 text-sm text-site-muted">
                        Manage your subscription and review past invoices.
                    </p>
                </header>

                {isPastDue && <PastDueBanner />}

                <CurrentPlanCard
                    current={current}
                    label={label ?? ''}
                    meta={tierMeta(current)}
                    status={tier.subscription_status}
                    currentPeriodEnd={tier.current_period_end}
                    cancelAtPeriodEnd={tier.cancel_at_period_end}
                    autoRenew={tier.auto_renew}
                />

                <div className="mt-10">
                    <InvoicesList invoices={invoices} />
                </div>

                <SupportFooter />

                {showCancel && (
                    <section className="mt-12 border-t border-site-border pt-8">
                        <h2 className="text-base font-semibold text-site-fg">Cancellation</h2>
                        <div className="mt-4 flex items-center justify-between gap-4">
                            <p className="text-sm text-site-fg">Cancel plan</p>
                            <CancelPlanDialog />
                        </div>
                    </section>
                )}
            </div>
        </AppSidebarLayout>
    );
}

function SupportFooter() {
    return (
        <section className="mt-10 rounded-2xl border border-site-border bg-site-surface p-5">
            <div className="flex items-start gap-3">
                <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0 text-site-muted" />
                <div>
                    <p className="text-sm font-medium text-site-fg">Questions about your plan?</p>
                    <p className="mt-0.5 text-xs text-site-muted">
                        Email{' '}
                        <a href="mailto:support@biizz.app" className="font-semibold text-brand hover:underline">
                            support@biizz.app
                        </a>
                        . Cancel any time, your data stays yours.
                    </p>
                </div>
            </div>
        </section>
    );
}
