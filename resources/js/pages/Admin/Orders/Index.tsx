import { Link } from '@inertiajs/react';
import { ShoppingBag } from 'lucide-react';
import { OrderFilters } from '@/components/admin/orders/OrderFilters';
import type { OrderFiltersState } from '@/components/admin/orders/OrderFilters';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { show as customerShow } from '@/routes/businesses/customers';
import { index, show as orderShow } from '@/routes/businesses/orders';
import { edit as productEdit } from '@/routes/businesses/products';
import type { Business, Order, OrderStatus } from '@/types';

// ─── Physical orders ────────────────────────────────────────────────────────

type PaginatedOrders = {
    data: (Order & { items_count: number })[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

// ─── Digital purchases ──────────────────────────────────────────────────────

type Purchase = {
    id: number;
    status: 'paid' | 'free' | 'pending';
    amount_paid: string;
    created_at: string;
    buyer: { id: number; name: string; email: string } | null;
    product: { id: number; name: string; slug: string } | null;
};

type PaginatedPurchases = {
    data: Purchase[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

// ─── Props ───────────────────────────────────────────────────────────────────

type Props =
    | {
          isDigital: false;
          business: Business;
          orders: PaginatedOrders;
          filters: OrderFiltersState;
      }
    | {
          isDigital: true;
          business: Business;
          purchases: PaginatedPurchases;
          filters: OrderFiltersState;
      };

// ─── Styles ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<OrderStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-emerald-100 text-emerald-800',
    fulfilled: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-zinc-100 text-zinc-700',
};

const PURCHASE_STATUS_STYLES: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-800',
    free: 'bg-blue-100 text-blue-800',
    pending: 'bg-amber-100 text-amber-800',
};

const SOURCE_STYLES: Record<string, string> = {
    storefront: 'bg-violet-100 text-violet-700',
    whatsapp: 'bg-green-100 text-green-700',
    instagram: 'bg-pink-100 text-pink-700',
};

// ─── Pagination ──────────────────────────────────────────────────────────────

function Pagination({
    prev,
    next,
    current,
    last,
}: {
    prev: string | null;
    next: string | null;
    current: number;
    last: number;
}) {
    if (!prev && !next) return null;
    return (
        <div className="mt-4 flex justify-between">
            <Link
                href={prev ?? '#'}
                className={`text-sm font-medium ${prev ? 'text-brand hover:underline' : 'pointer-events-none text-site-muted'}`}
            >
                ← Previous
            </Link>
            <span className="text-sm text-site-muted">
                Page {current} of {last}
            </span>
            <Link
                href={next ?? '#'}
                className={`text-sm font-medium ${next ? 'text-brand hover:underline' : 'pointer-events-none text-site-muted'}`}
            >
                Next →
            </Link>
        </div>
    );
}

// ─── Digital table ────────────────────────────────────────────────────────────

function DigitalTable({
    purchases,
    business,
    perPage,
    currentPage,
}: {
    purchases: PaginatedPurchases;
    business: Business;
    perPage: number;
    currentPage: number;
}) {
    if (purchases.data.length === 0) {
        return (
            <div className="rounded-2xl border border-site-border bg-site-surface p-12 text-center">
                <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-site-muted" />
                <p className="text-sm font-medium text-site-fg">
                    No purchases found
                </p>
                <p className="mt-1 text-xs text-site-muted">
                    Try adjusting your filters or check back later.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-site-border bg-white">
            <table className="w-full min-w-180 text-left">
                <thead>
                    <tr className="border-b border-site-border bg-site-surface">
                        <th className="py-2.5 pr-3 pl-4 text-xs font-semibold tracking-wide text-site-muted uppercase">
                            #
                        </th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">
                            Product
                        </th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">
                            Buyer
                        </th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">
                            Amount
                        </th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">
                            Status
                        </th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">
                            Date
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-site-border">
                    {purchases.data.map((p, i) => (
                        <tr
                            key={p.id}
                            className="transition-colors hover:bg-site-surface/50"
                        >
                            <td className="py-3 pr-3 pl-4 text-xs text-site-muted tabular-nums">
                                {(currentPage - 1) * perPage + i + 1}
                            </td>
                            <td className="px-3 py-3 text-sm font-medium text-site-fg">
                                {p.product?.slug ? (
                                    <Link
                                        href={productEdit({ business: business.slug, product: p.product.slug }).url}
                                        prefetch
                                        className="text-brand hover:underline"
                                    >
                                        {p.product.name}
                                    </Link>
                                ) : (
                                    p.product?.name ?? '-'
                                )}
                            </td>
                            <td className="px-3 py-3">
                                <p className="text-sm font-medium text-site-fg">
                                    {p.buyer?.name ?? '-'}
                                </p>
                                <p className="text-xs text-site-muted">
                                    {p.buyer?.email ?? ''}
                                </p>
                            </td>
                            <td className="px-3 py-3 text-sm font-semibold text-site-fg">
                                {p.status === 'free'
                                    ? 'Free'
                                    : `GHS ${parseFloat(p.amount_paid).toFixed(2)}`}
                            </td>
                            <td className="px-3 py-3">
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${PURCHASE_STATUS_STYLES[p.status] ?? 'bg-zinc-100 text-zinc-700'}`}
                                >
                                    {p.status}
                                </span>
                            </td>
                            <td className="px-3 py-3 text-xs text-site-muted">
                                {new Date(p.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Physical table ───────────────────────────────────────────────────────────

function PhysicalTable({
    orders,
    business,
    perPage,
    currentPage,
}: {
    orders: PaginatedOrders;
    business: Business;
    perPage: number;
    currentPage: number;
}) {
    if (orders.data.length === 0) {
        return (
            <div className="rounded-2xl border border-site-border bg-site-surface p-12 text-center">
                <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-site-muted" />
                <p className="text-sm font-medium text-site-fg">
                    No orders found
                </p>
                <p className="mt-1 text-xs text-site-muted">
                    Try adjusting your filters or check back later.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-site-border bg-white">
            <table className="w-full min-w-180 text-left">
                <thead>
                    <tr className="border-b border-site-border bg-site-surface">
                        <th className="py-2.5 pr-3 pl-4 text-xs font-semibold tracking-wide text-site-muted uppercase">
                            #
                        </th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">
                            Order ID
                        </th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">
                            Customer
                        </th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">
                            Total
                        </th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">
                            Status
                        </th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">
                            Source
                        </th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">
                            Date
                        </th>
                        <th className="py-2.5 pr-4 pl-3" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-site-border">
                    {orders.data.map((order, i) => (
                        <tr
                            key={order.id}
                            className="transition-colors hover:bg-site-surface/50"
                        >
                            <td className="py-3 pr-3 pl-4 text-xs text-site-muted tabular-nums">
                                {(currentPage - 1) * perPage + i + 1}
                            </td>
                            <td className="px-3 py-3 font-mono text-xs font-medium text-site-fg">
                                {order.order_id ?? '—'}
                            </td>
                            <td className="px-3 py-3">
                                {order.customer_id ? (
                                    <Link
                                        href={customerShow({ business: business.slug, customer: order.customer_id }).url}
                                        prefetch
                                        className="block hover:underline"
                                    >
                                        <p className="text-sm font-medium text-site-fg">
                                            {order.customer_name ?? '-'}
                                        </p>
                                        <p className="text-xs text-site-muted">
                                            {order.customer_email ?? ''}
                                        </p>
                                    </Link>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-site-fg">
                                            {order.customer_name ?? '-'}
                                        </p>
                                        <p className="text-xs text-site-muted">
                                            {order.customer_email ?? ''}
                                        </p>
                                    </>
                                )}
                            </td>
                            <td className="px-3 py-3 text-sm font-semibold text-site-fg">
                                {order.currency} {order.total}
                            </td>
                            <td className="px-3 py-3">
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[order.status]}`}
                                >
                                    {order.status}
                                </span>
                            </td>
                            <td className="px-3 py-3">
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${SOURCE_STYLES[order.source] ?? 'bg-zinc-100 text-zinc-700'}`}
                                >
                                    {order.source}
                                </span>
                            </td>
                            <td className="px-3 py-3 text-xs text-site-muted">
                                {new Date(
                                    order.created_at,
                                ).toLocaleDateString()}
                            </td>
                            <td className="py-3 pr-4 pl-3">
                                <Link
                                    href={
                                        orderShow({
                                            business: business.slug,
                                            order: order.order_id!,
                                        }).url
                                    }
                                    className="text-sm font-semibold text-brand hover:underline"
                                >
                                    View
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PHYSICAL_TABS = [
    'all',
    'pending',
    'paid',
    'fulfilled',
    'cancelled',
    'refunded',
] as const;
const DIGITAL_TABS = ['all', 'paid', 'free', 'pending'] as const;

export default function OrdersIndex(props: Props) {
    const { business, filters, isDigital } = props;
    const b = { business: business.slug };

    const tabs = isDigital ? DIGITAL_TABS : PHYSICAL_TABS;
    const total = isDigital ? props.purchases.total : props.orders.total;
    const paginated = isDigital ? props.purchases : props.orders;

    const tabHref = (tab: string) => {
        const params: Record<string, string> = {};
        if (tab !== 'all') params.status = tab;
        if (filters.search) params.search = filters.search;
        if (filters.date !== 'all') params.date = filters.date;
        if (filters.date === 'custom' && filters.date_from)
            params.date_from = filters.date_from;
        if (filters.date === 'custom' && filters.date_to)
            params.date_to = filters.date_to;
        const qs = new URLSearchParams(params).toString();
        return `${index(b).url}${qs ? `?${qs}` : ''}`;
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: show(b).url },
                { title: isDigital ? 'Sales' : 'Orders', href: index(b).url },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-site-fg">
                        {isDigital ? 'Sales' : 'Orders'}
                    </h1>
                    <p className="mt-0.5 text-sm text-site-muted">
                        {total} total
                    </p>
                </div>

                <OrderFilters
                    indexUrl={index(b).url}
                    filters={filters}
                    isDigital={isDigital}
                />

                <div className="mb-4 flex gap-1 overflow-x-auto border-b border-site-border pb-0">
                    {tabs.map((tab) => (
                        <Link
                            key={tab}
                            href={tabHref(tab)}
                            preserveScroll
                            only={
                                isDigital
                                    ? ['purchases', 'filters']
                                    : ['orders', 'filters']
                            }
                            className={`shrink-0 rounded-t px-4 py-2 text-sm font-medium capitalize transition ${
                                filters.status === tab
                                    ? 'border-b-2 border-brand text-brand'
                                    : 'text-site-muted hover:text-site-fg'
                            }`}
                        >
                            {tab}
                        </Link>
                    ))}
                </div>

                {isDigital ? (
                    <DigitalTable
                        purchases={props.purchases}
                        business={business}
                        perPage={props.purchases.per_page}
                        currentPage={props.purchases.current_page}
                    />
                ) : (
                    <PhysicalTable
                        orders={props.orders}
                        business={business}
                        perPage={props.orders.per_page}
                        currentPage={props.orders.current_page}
                    />
                )}

                <Pagination
                    prev={paginated.prev_page_url}
                    next={paginated.next_page_url}
                    current={paginated.current_page}
                    last={paginated.last_page}
                />
            </div>
        </AppSidebarLayout>
    );
}
