import { router, Link }  from '@inertiajs/react';
import { Package }        from 'lucide-react';
import { orders as ordersRoute, verifyPayment } from '@/actions/App/Http/Controllers/CustomerAccountController';
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
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-zinc-900">#{order.order_id ?? order.id}</p>
                                    <p className="text-xs text-zinc-400">{formatDate(order.created_at)}</p>
                                </div>
                                <StatusBadge status={order.status} />
                            </div>
                            {order.items && order.items.length > 0 && (
                                <ul className="mb-3 space-y-1 border-t border-zinc-100 pt-3">
                                    {order.items.map((item) => (
                                        <li key={item.id} className="flex justify-between text-sm text-zinc-600">
                                            <span>{item.product_name} × {item.quantity}</span>
                                            <span>GHS {Number(item.subtotal).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                                <span className="text-sm font-bold text-zinc-900">
                                    Total: GHS {Number(order.total).toFixed(2)}
                                </span>
                                {order.status === 'pending' && order.payment_ref && (
                                    <button
                                        type="button"
                                        onClick={() => router.post(verifyPayment.url({ business, order }))}
                                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                                        style={{ backgroundColor: accent }}
                                    >
                                        Verify Payment
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Pagination paginated={orders} accent={accent} />
        </div>
    );
}
