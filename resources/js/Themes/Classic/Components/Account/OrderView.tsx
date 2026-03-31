import { Link } from '@inertiajs/react';
import { ArrowLeft, Package, User, MapPin, ReceiptText } from 'lucide-react';
import { showPayment, orders } from '@/actions/App/Http/Controllers/CustomerAccountController';
import { StatusBadge } from './StatusBadge';
import { formatDate } from './utils';
import type { Business, Order } from './types';

interface OrderViewProps {
    order: Order;
    business: Business;
    accent: string;
}

export function OrderView({ order, business, accent }: OrderViewProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href={orders.url({ business: business.slug })}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h2 className="text-lg font-bold text-zinc-900">Order #{order.order_id ?? order.id}</h2>
                    <p className="text-sm text-zinc-500">Placed on {formatDate(order.created_at)}</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
                            <Package className="h-5 w-5 text-zinc-400" />
                            Items
                        </h3>
                        {order.items && order.items.length > 0 ? (
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center border-b border-zinc-50 pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium text-zinc-900">{item.product_name}</p>
                                            <p className="text-sm text-zinc-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium text-zinc-900">
                                            {order.currency} {Number(item.subtotal).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500">No items found.</p>
                        )}
                    </div>

                    {/* Order Totals */}
                    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-zinc-600">
                                <span>Subtotal</span>
                                <span>{order.currency} {Number(order.total).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-zinc-100 pt-3 text-base font-bold text-zinc-900">
                                <span>Total</span>
                                <span style={{ color: accent }}>{order.currency} {Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Payment Info */}
                    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
                            <ReceiptText className="h-5 w-5 text-zinc-400" />
                            Payment
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="mb-1 text-xs font-medium uppercase text-zinc-400">Status</p>
                                <StatusBadge status={order.status} />
                            </div>
                            {order.payment_ref && (
                                <div>
                                    <p className="mb-1 text-xs font-medium uppercase text-zinc-400">Reference</p>
                                    <Link 
                                        href={showPayment.url({ business: business.slug, order: String(order.payment_ref) })} 
                                        className="font-mono text-sm font-medium transition hover:opacity-80 break-all"
                                        style={{ color: accent }}
                                    >
                                        {order.payment_ref}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery / Contact Info */}
                    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
                            <User className="h-5 w-5 text-zinc-400" />
                            Customer details
                        </h3>
                        <div className="space-y-3 text-sm">
                            {(order.customer_name || order.customer?.name) && (
                                <p className="font-medium text-zinc-900">
                                    {order.customer_name ?? order.customer?.name}
                                </p>
                            )}
                            {(order.customer_email || order.customer?.email) && (
                                <p className="text-zinc-600">
                                    {order.customer_email ?? order.customer?.email}
                                </p>
                            )}
                            {(order.customer_phone || order.customer?.phone) && (
                                <p className="text-zinc-600">
                                    {order.customer_phone ?? order.customer?.phone}
                                </p>
                            )}
                            {!order.customer_name && !order.customer_email && !order.customer_phone && !order.customer && (
                                <p className="text-zinc-400">No contact details provided.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
