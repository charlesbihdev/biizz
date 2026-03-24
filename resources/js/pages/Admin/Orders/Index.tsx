import { Link, router } from '@inertiajs/react';
import { ShoppingBag } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { index, show as orderShow } from '@/routes/businesses/orders';
import type { Business, Order, OrderStatus } from '@/types';

type EnumCase = { name: string; value: string };

type PaginatedOrders = {
    data: (Order & { items_count: number })[];
    total: number;
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

type Props = {
    business: Business;
    orders: PaginatedOrders;
    statuses: EnumCase[];
};

const STATUS_STYLES: Record<OrderStatus, string> = {
    pending:   'bg-amber-100 text-amber-800',
    paid:      'bg-emerald-100 text-emerald-800',
    fulfilled: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded:  'bg-zinc-100 text-zinc-700',
};

const SOURCE_STYLES: Record<string, string> = {
    storefront: 'bg-violet-100 text-violet-700',
    whatsapp:   'bg-green-100 text-green-700',
    instagram:  'bg-pink-100 text-pink-700',
};

const ALL_TABS = ['all', 'pending', 'paid', 'fulfilled', 'cancelled', 'refunded'] as const;

export default function OrdersIndex({ business, orders, statuses: _statuses }: Props) {
    const b = { business: business.slug };
    const activeStatus = (new URLSearchParams(window.location.search)).get('status') ?? 'all';

    const switchTab = (tab: string) => {
        router.visit(index(b).url, {
            data: tab === 'all' ? {} : { status: tab },
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: show(b).url },
                { title: 'Orders', href: index(b).url },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-site-fg">Orders</h1>
                    <p className="mt-0.5 text-sm text-site-muted">{orders.total} total</p>
                </div>

                {/* Status Tabs */}
                <div className="mb-4 flex gap-1 overflow-x-auto border-b border-site-border pb-0">
                    {ALL_TABS.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => switchTab(tab)}
                            className={`shrink-0 rounded-t px-4 py-2 text-sm font-medium capitalize transition ${
                                activeStatus === tab
                                    ? 'border-b-2 border-brand text-brand'
                                    : 'text-site-muted hover:text-site-fg'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {orders.data.length === 0 ? (
                    <div className="rounded-2xl border border-site-border bg-site-surface p-12 text-center">
                        <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-site-muted" />
                        <p className="text-sm font-medium text-site-fg">No orders yet</p>
                        <p className="mt-1 text-xs text-site-muted">Orders will appear here once customers start purchasing.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-site-border bg-white">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-site-border bg-site-surface">
                                    <th className="py-2.5 pl-4 pr-3 text-xs font-semibold uppercase tracking-wide text-site-muted">Customer</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Total</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Status</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Source</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Date</th>
                                    <th className="py-2.5 pl-3 pr-4" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-site-border">
                                {orders.data.map((order) => (
                                    <tr key={order.id} className="hover:bg-site-surface/50 transition-colors">
                                        <td className="py-3 pl-4 pr-3">
                                            <p className="text-sm font-medium text-site-fg">{order.customer_name ?? '—'}</p>
                                            <p className="text-xs text-site-muted">{order.customer_email ?? ''}</p>
                                        </td>
                                        <td className="px-3 py-3 text-sm font-semibold text-site-fg">
                                            {order.currency} {order.total}
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${SOURCE_STYLES[order.source] ?? 'bg-zinc-100 text-zinc-700'}`}>
                                                {order.source}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-xs text-site-muted">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 pl-3 pr-4">
                                            <Link
                                                href={orderShow({ business: business.slug, order: order.id }).url}
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
                )}

                {/* Pagination */}
                {(orders.prev_page_url || orders.next_page_url) && (
                    <div className="mt-4 flex justify-between">
                        <Link
                            href={orders.prev_page_url ?? '#'}
                            className={`text-sm font-medium ${orders.prev_page_url ? 'text-brand hover:underline' : 'pointer-events-none text-site-muted'}`}
                        >
                            ← Previous
                        </Link>
                        <span className="text-sm text-site-muted">Page {orders.current_page} of {orders.last_page}</span>
                        <Link
                            href={orders.next_page_url ?? '#'}
                            className={`text-sm font-medium ${orders.next_page_url ? 'text-brand hover:underline' : 'pointer-events-none text-site-muted'}`}
                        >
                            Next →
                        </Link>
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
