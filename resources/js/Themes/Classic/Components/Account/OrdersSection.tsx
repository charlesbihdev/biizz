import { router, Link }  from '@inertiajs/react';
import { Package }        from 'lucide-react';
import { orders as ordersRoute, verifyPayment, showOrder } from '@/actions/App/Http/Controllers/CustomerAccountController';
import { AccountFilters } from './AccountFilters';
import { FlashMessages }  from './FlashMessages';
import { Pagination }     from './Pagination';
import { StatusBadge }    from './StatusBadge';
import { ORDER_STATUS_TABS } from './constants';
import { formatDate }     from './utils';
import type { Business, FilterState, PaginatedOrders } from './types';

interface OrdersSectionProps {
    orders:   PaginatedOrders;
    business: Business;
    accent:   string;
    filters:  FilterState;
}

export function OrdersSection({ orders, business, accent, filters }: OrdersSectionProps) {
    return (
        <div>
            <AccountFilters
                sectionUrl={ordersRoute.url(business)}
                filters={filters}
                onlyKey="orders"
                accent={accent}
                statusTabs={ORDER_STATUS_TABS}
            />
            <FlashMessages />
            {orders.data.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-zinc-400">
                    <Package className="mb-3 h-12 w-12 opacity-30" />
                    <p className="text-sm">No orders found.</p>
                    <Link href={`/s/${business.slug}`} className="mt-4 text-sm font-medium" style={{ color: accent }}>
                        Start shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.data.map((order) => (
                        <div key={order.id} className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex items-start justify-between">
                                <div>
                                    <p className="font-semibold text-zinc-900">#{order.order_id ?? order.id}</p>
                                    <p className="text-xs text-zinc-400">Placed on {formatDate(order.created_at)}</p>
                                    <p className="mt-1 text-sm font-medium text-zinc-600">
                                        {order.items?.length || 0} items
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <StatusBadge status={order.status} />
                                    <span className="text-sm font-bold text-zinc-900">
                                        {order.currency} {Number(order.total).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-3">
                                {order.status === 'pending' && order.payment_ref && (
                                    <button
                                        type="button"
                                        onClick={() => router.post(verifyPayment.url({ business: business.slug, order: order.id }))}
                                        className="rounded-lg px-4 py-1.5 text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition"
                                    >
                                        Verify Payment
                                    </button>
                                )}
                                <Link
                                    href={showOrder.url({ business: business.slug, order: String(order.order_id ?? order.id) })}
                                    className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                                    style={{ backgroundColor: accent }}
                                >
                                    View details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Pagination paginated={orders} accent={accent} />
        </div>
    );
}
