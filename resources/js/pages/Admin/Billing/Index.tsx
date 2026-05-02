import { LifeBuoy } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { CurrentPlanCard } from '@/components/admin/billing/CurrentPlanCard';
import { InvoicesList } from '@/components/admin/billing/InvoicesList';
import { useTier } from '@/hooks/use-tier';
import { show as businessShow } from '@/routes/businesses';
import type { Business, SubscriptionInvoice } from '@/types';

type Props = {
    business: Business;
    currency: string;
    invoices: SubscriptionInvoice[];
};

export default function BillingIndex({ business, currency, invoices }: Props) {
    const { tier, current, label, tierMeta } = useTier();

    if (!tier || !current) return null;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: businessShow({ business: business.slug }).url },
                { title: 'Billing', href: '#' },
            ]}
        >
            <div className="p-6 lg:p-8">
                <header className="mb-6">
                    <h1 className="text-xl font-bold text-site-fg">Billing</h1>
                    <p className="mt-0.5 text-sm text-site-muted">
                        Manage your subscription and review past invoices.
                    </p>
                </header>

                <CurrentPlanCard
                    current={current}
                    label={label ?? ''}
                    meta={tierMeta(current)}
                    currency={currency}
                    status={tier.subscription_status}
                    currentPeriodEnd={tier.current_period_end}
                    cancelAtPeriodEnd={tier.cancel_at_period_end}
                />

                <div className="mt-10">
                    <InvoicesList invoices={invoices} />
                </div>

                <SupportFooter />
            </div>
        </AppSidebarLayout>
    );
}

function SupportFooter() {
    return (
        <section className="mt-8 rounded-2xl border border-site-border bg-site-surface p-5">
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
