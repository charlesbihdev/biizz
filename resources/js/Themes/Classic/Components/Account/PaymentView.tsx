import { Link, router } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Receipt } from 'lucide-react';
import { payments, showOrder, verifyPayment } from '@/actions/App/Http/Controllers/CustomerAccountController';
import { StatusBadge } from './StatusBadge';
import { formatDate } from './utils';
import type { Business, Order } from './types';

interface PaymentViewProps {
    order: Order;
    business: Business;
    accent: string;
}

export function PaymentView({ order, business, accent }: PaymentViewProps) {
    const handleVerify = () => {
        router.post(verifyPayment.url({ business: business.slug, order: order.id }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href={payments.url({ business: business.slug })}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h2 className="text-lg font-bold text-zinc-900">Payment Details</h2>
                    {order.payment_ref && (
                        <p className="text-sm font-mono text-zinc-500">{order.payment_ref}</p>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Payment Details Section */}
                <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm space-y-6">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900">
                        <CreditCard className="h-5 w-5 text-zinc-400" />
                        Information
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-y-6">
                        <div>
                            <p className="text-xs font-medium uppercase text-zinc-400 mb-1">Status</p>
                            <StatusBadge status={order.status} />
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase text-zinc-400 mb-1">Amount</p>
                            <p className="font-semibold text-zinc-900">
                                {order.currency} {Number(order.total).toFixed(2)}
                            </p>
                        </div>
                        {order.payment_provider && (
                            <div>
                                <p className="text-xs font-medium uppercase text-zinc-400 mb-1">Provider</p>
                                <p className="text-sm font-medium capitalize text-zinc-900">
                                    {order.payment_provider}
                                </p>
                            </div>
                        )}
                        {order.paid_at && (
                            <div>
                                <p className="text-xs font-medium uppercase text-zinc-400 mb-1">Paid At</p>
                                <p className="text-sm font-medium text-zinc-900">
                                    {formatDate(order.paid_at)}
                                </p>
                            </div>
                        )}
                    </div>

                    {order.status === 'pending' && (
                        <div className="pt-4 border-t border-zinc-100">
                            <button
                                type="button"
                                onClick={handleVerify}
                                className="w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                                style={{ backgroundColor: accent }}
                            >
                                Verify Payment
                            </button>
                        </div>
                    )}
                </div>

                {/* Related Order Section */}
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6 shadow-sm border-dashed">
                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
                        <Receipt className="h-5 w-5 text-zinc-400" />
                        Related Order
                    </h3>
                    
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-zinc-900">Order #{order.order_id ?? order.id}</p>
                                <p className="text-xs text-zinc-500">Placed on {formatDate(order.created_at)}</p>
                            </div>
                            <p className="font-bold text-zinc-900">
                                {order.currency} {Number(order.total).toFixed(2)}
                            </p>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-zinc-100">
                            <span className="text-sm font-medium text-zinc-600">
                                {order.items?.length || 0} items
                            </span>
                            <Link 
                                href={showOrder.url({ business: business.slug, order: String(order.order_id ?? order.id) })}
                                className="text-sm font-semibold transition hover:opacity-80"
                                style={{ color: accent }}
                            >
                                View Order
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
