import { Link } from '@inertiajs/react';
import { show as customerShow } from '@/routes/businesses/customers';
import { show as paymentShow } from '@/routes/businesses/payments';
import type { Business, Payment } from '@/types';
import { fmtAmount, GATEWAY_STYLES, STATUS_STYLES } from './paymentDisplay';
import { PaymentsEmptyState } from './PaymentsEmptyState';

type Paginated<T> = { data: T[]; per_page: number; current_page: number };

type Props = {
    payments: Paginated<Payment>;
    business: Business;
};

export function StorefrontPaymentsTable({ payments, business }: Props) {
    if (payments.data.length === 0) return <PaymentsEmptyState isDigital={false} />;

    const { per_page: perPage, current_page: currentPage } = payments;

    return (
        <div className="overflow-x-auto rounded-xl border border-site-border bg-white">
            <table className="w-full min-w-180 text-left">
                <thead>
                    <tr className="border-b border-site-border bg-site-surface">
                        <th className="py-2.5 pr-3 pl-4 text-xs font-semibold tracking-wide text-site-muted uppercase">#</th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">Reference</th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">Customer</th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">Amount</th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">Gateway</th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">Status</th>
                        <th className="px-3 py-2.5 text-xs font-semibold tracking-wide text-site-muted uppercase">Date</th>
                        <th className="py-2.5 pr-4 pl-3" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-site-border">
                    {payments.data.map((p, i) => (
                        <tr key={p.id} className="transition-colors hover:bg-site-surface/50">
                            <td className="py-3 pr-3 pl-4 text-xs text-site-muted tabular-nums">
                                {(currentPage - 1) * perPage + i + 1}
                            </td>
                            <td className="px-3 py-3 font-mono text-xs font-medium text-site-fg">
                                {p.reference}
                            </td>
                            <td className="px-3 py-3">
                                {p.customer?.id ? (
                                    <Link
                                        href={customerShow({ business: business.slug, customer: p.customer.id }).url}
                                        prefetch
                                        className="block hover:underline"
                                    >
                                        <p className="text-sm font-medium text-site-fg">
                                            {p.customer.name ?? p.order?.customer_name ?? '-'}
                                        </p>
                                        <p className="text-xs text-site-muted">
                                            {p.customer.email ?? p.order?.customer_email ?? ''}
                                        </p>
                                    </Link>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-site-fg">
                                            {p.order?.customer_name ?? '-'}
                                        </p>
                                        <p className="text-xs text-site-muted">
                                            {p.order?.customer_email ?? ''}
                                        </p>
                                    </>
                                )}
                            </td>
                            <td className="px-3 py-3 text-sm font-semibold text-site-fg tabular-nums">
                                {fmtAmount(p.amount, p.currency)}
                            </td>
                            <td className="px-3 py-3">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${GATEWAY_STYLES[p.gateway]}`}>
                                    {p.gateway}
                                </span>
                            </td>
                            <td className="px-3 py-3">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[p.status]}`}>
                                    {p.status}
                                </span>
                            </td>
                            <td className="px-3 py-3 text-xs text-site-muted">
                                {new Date(p.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 pr-4 pl-3">
                                <Link
                                    href={paymentShow({ business: business.slug, payment: p.reference }).url}
                                    prefetch
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
