import { formatPrice, formatShortDate } from '@/lib/utils';
import type { SubscriptionInvoice, SubscriptionInvoiceStatus } from '@/types';

interface Props {
    invoices: SubscriptionInvoice[];
}

const TIER_LABEL: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    pro_max: 'Pro Max',
};

const STATUS_TONE: Record<SubscriptionInvoiceStatus, string> = {
    paid: 'text-emerald-600',
    pending: 'text-amber-600',
    failed: 'text-red-600',
    refunded: 'text-site-muted',
};

const STATUS_LABEL: Record<SubscriptionInvoiceStatus, string> = {
    paid: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
    refunded: 'Refunded',
};

export function InvoicesList({ invoices }: Props) {
    return (
        <section>
            <h2 className="text-base font-semibold text-site-fg">Invoices</h2>

            {invoices.length === 0 ? (
                <p className="mt-4 text-sm text-site-muted">
                    Receipts will appear here after your first paid billing cycle.
                </p>
            ) : (
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-site-border text-left text-[11px] font-semibold uppercase tracking-widest text-site-muted">
                                <th className="py-3 pr-4 font-semibold">Date</th>
                                <th className="py-3 pr-4 font-semibold">Plan</th>
                                <th className="py-3 pr-4 font-semibold">Amount</th>
                                <th className="py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-site-border">
                            {invoices.map((invoice) => (
                                <InvoiceRow key={invoice.id} invoice={invoice} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

function InvoiceRow({ invoice }: { invoice: SubscriptionInvoice }) {
    const tierLabel = TIER_LABEL[invoice.tier] ?? invoice.tier;
    const dateLabel = invoice.paid_at ? formatShortDate(invoice.paid_at) : formatShortDate(invoice.created_at);

    return (
        <tr>
            <td className="py-4 pr-4 text-site-fg">{dateLabel}</td>
            <td className="py-4 pr-4 text-site-fg">{tierLabel}</td>
            <td className="py-4 pr-4 font-medium text-site-fg">
                {formatPrice(invoice.amount, invoice.currency)}
            </td>
            <td className={`py-4 font-medium ${STATUS_TONE[invoice.status]}`}>
                {STATUS_LABEL[invoice.status]}
            </td>
        </tr>
    );
}
