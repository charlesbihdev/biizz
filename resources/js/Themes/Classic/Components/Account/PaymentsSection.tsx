import { router }         from '@inertiajs/react';
import { CreditCard }     from 'lucide-react';
import { payments as paymentsRoute, verifyPayment } from '@/actions/App/Http/Controllers/CustomerAccountController';
import { AccountFilters } from './AccountFilters';
import { FlashMessages }  from './FlashMessages';
import { Pagination }     from './Pagination';
import { StatusBadge }    from './StatusBadge';
import { PAYMENT_STATUS_TABS } from './constants';
import { formatDate }     from './utils';
import type { Business, FilterState, PaginatedOrders } from './types';

interface PaymentsSectionProps {
    payments: PaginatedOrders;
    business: Business;
    accent:   string;
    filters:  FilterState;
}

export function PaymentsSection({ payments, business, accent, filters }: PaymentsSectionProps) {
    return (
        <div>
            <AccountFilters
                sectionUrl={paymentsRoute.url(business)}
                filters={filters}
                onlyKey="payments"
                accent={accent}
                statusTabs={PAYMENT_STATUS_TABS}
            />
            <FlashMessages />
            {payments.data.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-zinc-400">
                    <CreditCard className="mb-3 h-12 w-12 opacity-30" />
                    <p className="text-sm">No payment records found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {payments.data.map((order) => (
                        <div key={order.id} className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 space-y-1">
                                    <p className="font-semibold text-zinc-900">#{order.order_id ?? order.id}</p>
                                    <p className="text-xs text-zinc-400">{formatDate(order.created_at)}</p>
                                    <p className="truncate font-mono text-xs text-zinc-500">{order.payment_ref}</p>
                                    {order.payment_provider && (
                                        <p className="capitalize text-xs text-zinc-400">{order.payment_provider}</p>
                                    )}
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-2">
                                    <StatusBadge status={order.status} />
                                    <p className="text-sm font-bold text-zinc-900">GHS {Number(order.total).toFixed(2)}</p>
                                    {order.paid_at && (
                                        <p className="text-xs text-zinc-400">{formatDate(order.paid_at)}</p>
                                    )}
                                    {order.status === 'pending' && (
                                        <button
                                            type="button"
                                            onClick={() => router.post(verifyPayment.url({ business, order }))}
                                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                                            style={{ backgroundColor: accent }}
                                        >
                                            Verify
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Pagination paginated={payments} accent={accent} />
        </div>
    );
}
