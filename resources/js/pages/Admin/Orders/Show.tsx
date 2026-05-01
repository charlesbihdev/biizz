import { Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show as businessShow } from '@/routes/businesses';
import { show as customerShow } from '@/routes/businesses/customers';
import { index, show, updateStatus } from '@/routes/businesses/orders';
import { show as paymentShow } from '@/routes/businesses/payments';
import { edit as productEdit } from '@/routes/businesses/products';
import type { Business, Order, OrderStatus } from '@/types';

type EnumCase = { name: string; value: string };

type Props = {
    business: Business;
    order: Order;
    statuses: EnumCase[];
};

const STATUS_STYLES: Record<OrderStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-emerald-100 text-emerald-800',
    fulfilled: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-zinc-100 text-zinc-700',
};

const SOURCE_LABELS: Record<string, string> = {
    storefront: 'Storefront',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
};

export default function OrderShow({ business, order, statuses }: Props) {
    const b = { business: business.slug };
    const o = { business: business.slug, order: order.order_id! };

    const { data, setData, submit, processing } = useForm({
        status: order.status,
    });

    const hasDeliveryAddress = Boolean(
        order.delivery_address ||
        order.delivery_city ||
        order.delivery_region ||
        order.delivery_country,
    );
    const cityRegion = [order.delivery_city, order.delivery_region]
        .filter(Boolean)
        .join(', ');

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: businessShow(b).url },
                { title: 'Orders', href: index(b).url },
                { title: `#${order.order_id}`, href: show(o).url },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-site-fg">
                            Order #{order.order_id}
                        </h1>
                        <p className="mt-0.5 text-sm text-site-muted">
                            {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                    <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${STATUS_STYLES[order.status]}`}
                    >
                        {order.status}
                    </span>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Customer Info */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-xl border border-site-border bg-white p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-sm font-semibold tracking-wide text-site-muted uppercase">
                                    Customer
                                </h2>
                                {order.customer_id && (
                                    <Link
                                        href={customerShow({ business: business.slug, customer: order.customer_id }).url}
                                        prefetch
                                        className="text-xs font-semibold text-brand hover:underline"
                                    >
                                        Open profile →
                                    </Link>
                                )}
                            </div>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-site-muted">Name</dt>
                                    <dd className="font-medium text-site-fg">
                                        {order.customer_name ?? '-'}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-site-muted">Email</dt>
                                    <dd className="font-medium text-site-fg">
                                        {order.customer_email ?? '-'}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-site-muted">Phone</dt>
                                    <dd className="font-medium text-site-fg">
                                        {order.customer_phone ?? '-'}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-site-muted">Source</dt>
                                    <dd className="font-medium text-site-fg">
                                        {SOURCE_LABELS[order.source] ??
                                            order.source}
                                    </dd>
                                </div>
                                {order.payment_ref && (
                                    <div className="flex justify-between">
                                        <dt className="text-site-muted">
                                            Payment ref
                                        </dt>
                                        <dd className="font-mono text-xs">
                                            <Link
                                                href={paymentShow({ business: business.slug, payment: order.payment_ref }).url}
                                                prefetch
                                                className="text-brand hover:underline"
                                            >
                                                {order.payment_ref}
                                            </Link>
                                        </dd>
                                    </div>
                                )}
                                {order.payment_provider && (
                                    <div className="flex justify-between">
                                        <dt className="text-site-muted">
                                            Provider
                                        </dt>
                                        <dd className="font-medium text-site-fg capitalize">
                                            {order.payment_provider}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Delivery Address */}
                        {hasDeliveryAddress && (
                            <div className="rounded-xl border border-site-border bg-white p-5">
                                <h2 className="mb-4 text-sm font-semibold tracking-wide text-site-muted uppercase">
                                    Customer's Address
                                </h2>
                                <address className="text-sm leading-relaxed text-site-fg not-italic">
                                    {order.delivery_address && (
                                        <div className="font-medium">
                                            {order.delivery_address}
                                        </div>
                                    )}
                                    {cityRegion && (
                                        <div className="text-site-muted">
                                            {cityRegion}
                                        </div>
                                    )}
                                    {order.delivery_country && (
                                        <div className="text-site-muted">
                                            {order.delivery_country}
                                        </div>
                                    )}
                                </address>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="overflow-hidden rounded-xl border border-site-border bg-white">
                            <h2 className="border-b border-site-border px-5 py-3 text-sm font-semibold tracking-wide text-site-muted uppercase">
                                Items
                            </h2>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-site-border bg-site-surface">
                                        <th className="py-2.5 pr-3 pl-5 text-xs font-semibold tracking-wide text-site-muted uppercase">
                                            Product
                                        </th>
                                        <th className="px-3 py-2.5 text-right text-xs font-semibold tracking-wide text-site-muted uppercase">
                                            Unit
                                        </th>
                                        <th className="px-3 py-2.5 text-right text-xs font-semibold tracking-wide text-site-muted uppercase">
                                            Qty
                                        </th>
                                        <th className="py-2.5 pr-5 pl-3 text-right text-xs font-semibold tracking-wide text-site-muted uppercase">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-site-border">
                                    {(order.items ?? []).map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-3 pr-3 pl-5 font-medium text-site-fg">
                                                {item.product?.slug ? (
                                                    <Link
                                                        href={productEdit({ business: business.slug, product: item.product.slug }).url}
                                                        prefetch
                                                        className="text-brand hover:underline"
                                                    >
                                                        {item.product_name}
                                                    </Link>
                                                ) : (
                                                    item.product_name
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right text-site-muted">
                                                {order.currency}{' '}
                                                {item.unit_price}
                                            </td>
                                            <td className="px-3 py-3 text-right text-site-muted">
                                                {item.quantity}
                                            </td>
                                            <td className="py-3 pr-5 pl-3 text-right font-semibold text-site-fg">
                                                {order.currency} {item.subtotal}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-site-border">
                                        <td
                                            colSpan={3}
                                            className="py-3 pr-3 pl-5 text-right text-sm font-semibold text-site-fg"
                                        >
                                            Total
                                        </td>
                                        <td className="py-3 pr-5 pl-3 text-right text-base font-bold text-site-fg">
                                            {order.currency} {order.total}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Status Update */}
                    <div className="h-fit rounded-xl border border-site-border bg-white p-5">
                        <h2 className="mb-4 text-sm font-semibold tracking-wide text-site-muted uppercase">
                            Update Status
                        </h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                submit(updateStatus(o));
                            }}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) =>
                                        setData(
                                            'status',
                                            e.target.value as OrderStatus,
                                        )
                                    }
                                    className="w-full rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                                >
                                    {statuses.map((s) => (
                                        <option
                                            key={s.value}
                                            value={s.value}
                                            className="capitalize"
                                        >
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                            >
                                {processing && (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
