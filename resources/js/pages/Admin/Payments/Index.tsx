import { PaymentFilters } from '@/components/admin/payments/PaymentFilters';
import type { PaymentFiltersState } from '@/components/admin/payments/PaymentFilters';
import { PaymentStatsRow } from '@/components/admin/payments/PaymentStatsRow';
import { PaymentTabs } from '@/components/admin/payments/PaymentTabs';
import { PaymentsPagination } from '@/components/admin/payments/PaymentsPagination';
import { StorefrontPaymentsTable } from '@/components/admin/payments/StorefrontPaymentsTable';
import { MarketplacePaymentsTable } from '@/components/admin/payments/MarketplacePaymentsTable';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show as businessShow } from '@/routes/businesses';
import { index } from '@/routes/businesses/payments';
import type { Business, MarketplacePayment, Payment, PaymentStats } from '@/types';

type Paginated<T> = {
    data: T[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

type Props =
    | {
          isDigital: false;
          business: Business;
          payments: Paginated<Payment>;
          stats?: PaymentStats;
          filters: PaymentFiltersState;
      }
    | {
          isDigital: true;
          business: Business;
          payments: Paginated<MarketplacePayment>;
          stats?: PaymentStats;
          filters: PaymentFiltersState;
      };

export default function PaymentsIndex(props: Props) {
    const { business, filters, isDigital, stats } = props;
    const b = { business: business.slug };
    const indexUrl = index(b).url;
    const paginated = props.payments;
    const currency = paginated.data[0]?.currency ?? 'GHS';

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: businessShow(b).url },
                { title: 'Payments',    href: indexUrl },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-site-fg">Payments</h1>
                    <p className="mt-0.5 text-sm text-site-muted">
                        {paginated.total} total
                    </p>
                </div>

                <PaymentStatsRow stats={stats} currency={currency} filters={filters} />

                <PaymentFilters indexUrl={indexUrl} filters={filters} isDigital={isDigital} />

                <PaymentTabs indexUrl={indexUrl} filters={filters} />

                {isDigital ? (
                    <MarketplacePaymentsTable payments={props.payments} business={business} />
                ) : (
                    <StorefrontPaymentsTable payments={props.payments} business={business} />
                )}

                <PaymentsPagination
                    prev={paginated.prev_page_url}
                    next={paginated.next_page_url}
                    current={paginated.current_page}
                    last={paginated.last_page}
                />
            </div>
        </AppSidebarLayout>
    );
}
