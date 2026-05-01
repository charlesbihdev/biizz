import { Link } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show as businessShow } from '@/routes/businesses';
import { index as paymentsIndex } from '@/routes/businesses/payments';
import { edit as productEdit } from '@/routes/businesses/products';
import type { Business, MarketplacePayment, PaymentGateway, PaymentStatus } from '@/types';

type Props = {
    business: Business;
    payment: MarketplacePayment;
};

const STATUS_STYLES: Record<PaymentStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    success: 'bg-emerald-100 text-emerald-800',
    failed:  'bg-red-100 text-red-700',
};

const GATEWAY_STYLES: Record<PaymentGateway, string> = {
    paystack: 'bg-sky-100 text-sky-800',
    junipay:  'bg-violet-100 text-violet-800',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-4">
            <dt className="text-site-muted">{label}</dt>
            <dd className="text-right font-medium text-site-fg">{children}</dd>
        </div>
    );
}

export default function MarketplacePaymentShow({ business, payment }: Props) {
    const b = { business: business.slug };
    const fmtAmount = `${payment.currency} ${parseFloat(payment.amount).toFixed(2)}`;
    const purchase = payment.purchase;
    const buyer = purchase?.buyer ?? null;
    const product = purchase?.product ?? null;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: businessShow(b).url },
                { title: 'Payments',    href: paymentsIndex(b).url },
                { title: payment.reference, href: '#' },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="font-mono text-lg font-bold text-site-fg">
                            {payment.reference}
                        </h1>
                        <p className="mt-0.5 text-sm text-site-muted">
                            Received {new Date(payment.created_at).toLocaleString()}
                        </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${STATUS_STYLES[payment.status]}`}>
                        {payment.status}
                    </span>
                </div>

                <div className="grid gap-6">
                    <div className="space-y-6">
                        <div className="rounded-xl border border-site-border bg-white p-5">
                            <h2 className="mb-4 text-sm font-semibold tracking-wide text-site-muted uppercase">
                                Payment Summary
                            </h2>
                            <dl className="space-y-2 text-sm">
                                <Field label="Amount">
                                    <span className="tabular-nums">{fmtAmount}</span>
                                </Field>
                                <Field label="Gateway">
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${GATEWAY_STYLES[payment.gateway]}`}>
                                        {payment.gateway}
                                    </span>
                                </Field>
                                <Field label="Reference">
                                    <span className="font-mono text-xs">{payment.reference}</span>
                                </Field>
                                <Field label="Transaction ID">
                                    <span className="font-mono text-xs">{payment.transaction_id ?? '—'}</span>
                                </Field>
                                <Field label="Paid at">
                                    {payment.paid_at ? new Date(payment.paid_at).toLocaleString() : '—'}
                                </Field>
                                <Field label="Created at">
                                    {new Date(payment.created_at).toLocaleString()}
                                </Field>
                            </dl>
                        </div>

                        {product && (
                            <div className="rounded-xl border border-site-border bg-white p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-sm font-semibold tracking-wide text-site-muted uppercase">
                                        Product
                                    </h2>
                                    <Link
                                        href={productEdit({ business: business.slug, product: product.slug }).url}
                                        prefetch
                                        className="text-xs font-semibold text-brand hover:underline"
                                    >
                                        Open product →
                                    </Link>
                                </div>
                                <dl className="space-y-2 text-sm">
                                    <Field label="Name">{product.name}</Field>
                                    <Field label="Slug">
                                        <span className="font-mono text-xs">{product.slug}</span>
                                    </Field>
                                </dl>
                            </div>
                        )}

                        {buyer && (
                            <div className="rounded-xl border border-site-border bg-white p-5">
                                <h2 className="mb-4 text-sm font-semibold tracking-wide text-site-muted uppercase">
                                    Buyer
                                </h2>
                                <dl className="space-y-2 text-sm">
                                    <Field label="Name">{buyer.name}</Field>
                                    <Field label="Email">{buyer.email}</Field>
                                </dl>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
