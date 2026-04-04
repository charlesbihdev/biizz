import { Link, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show as businessShow } from '@/routes/businesses';
import { block, index, show, update } from '@/routes/businesses/customers';
import { show as orderShow } from '@/routes/businesses/orders';
import type { Business, Customer, Order, PaginatedData } from '@/types';

const STATUS_STYLES: Record<string, string> = {
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

type Props = {
    business: Business;
    customer: Customer;
    orders: PaginatedData<Order>;
};

export default function CustomerShow({ business, customer, orders }: Props) {
    const b = { business: business.slug };
    const c = { business: business.slug, customer: customer.id };

    const { data, setData, submit, processing, errors } = useForm({
        name:  customer.name,
        phone: customer.phone ?? '',
        notes: customer.notes ?? '',
    });

    const [blockOpen, setBlockOpen] = useState(false);
    const [blockProcessing, setBlockProcessing] = useState(false);

    const handleBlock = () => {
        setBlockProcessing(true);
        router.patch(block(c).url, {}, {
            onFinish: () => {
                setBlockProcessing(false);
                setBlockOpen(false);
            },
        });
    };

    const initials = customer.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name,  href: businessShow(b).url },
                { title: 'Customers',    href: index(b).url },
                { title: customer.name,  href: show(c).url },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-site-fg">{customer.name}</h1>
                    <p className="mt-0.5 text-sm text-site-muted">
                        Customer since {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left: profile + edit form */}
                    <div className="space-y-6">
                        {/* Avatar + contact */}
                        <div className="rounded-xl border border-site-border bg-white p-5">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                                    {initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-sm font-semibold text-site-fg">{customer.name}</p>
                                        {customer.is_blocked && (
                                            <span className="inline-flex shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                                Blocked
                                            </span>
                                        )}
                                    </div>
                                    <p className="truncate text-xs text-site-muted">{customer.email ?? '—'}</p>
                                </div>
                            </div>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-site-muted">Phone</dt>
                                    <dd className="font-medium text-site-fg">{customer.phone ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-site-muted">Orders</dt>
                                    <dd className="font-medium text-site-fg">{orders.total}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-site-muted">Joined</dt>
                                    <dd className="font-medium text-site-fg">
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Edit form */}
                        <div className="rounded-xl border border-site-border bg-white p-5">
                            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-site-muted">Edit</h2>
                            <form
                                onSubmit={(e) => { e.preventDefault(); submit(update(c)); }}
                                className="flex flex-col gap-4"
                            >
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="name">Name</Label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        className="rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="phone">Phone</Label>
                                    <input
                                        id="phone"
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Optional"
                                        className="rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        placeholder="Internal notes…"
                                        className="rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                                    />
                                    <InputError message={errors.notes} />
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                                >
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Save
                                </button>
                            </form>

                            <div className="mt-4 border-t border-site-border pt-4">
                                <button
                                    type="button"
                                    onClick={() => setBlockOpen(true)}
                                    className={`w-full rounded-full py-2.5 text-sm font-bold transition ${
                                        customer.is_blocked
                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                                    }`}
                                >
                                    {customer.is_blocked ? 'Unblock Customer' : 'Block Customer'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: order history */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border border-site-border bg-white overflow-hidden">
                            <h2 className="border-b border-site-border px-5 py-3 text-sm font-semibold uppercase tracking-wide text-site-muted">
                                Order History
                            </h2>

                            {orders.data.length === 0 ? (
                                <div className="p-10 text-center">
                                    <p className="text-sm text-site-muted">No orders yet.</p>
                                </div>
                            ) : (
                                <>
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-site-border bg-site-surface">
                                                <th className="py-2.5 pl-5 pr-3 text-xs font-semibold uppercase tracking-wide text-site-muted">Order ID</th>
                                                <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Total</th>
                                                <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Status</th>
                                                <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Source</th>
                                                <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Date</th>
                                                <th className="py-2.5 pl-3 pr-5" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-site-border">
                                            {orders.data.map((order) => (
                                                <tr key={order.id} className="transition-colors hover:bg-site-surface/50">
                                                    <td className="py-3 pl-5 pr-3 font-mono text-xs font-medium text-site-fg">
                                                        {order.order_id ?? '—'}
                                                    </td>
                                                    <td className="px-3 py-3 text-sm font-semibold text-site-fg">
                                                        {order.currency} {order.total}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[order.status] ?? 'bg-zinc-100 text-zinc-700'}`}>
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
                                                    <td className="py-3 pl-3 pr-5 text-right">
                                                        <Link
                                                            href={orderShow({ business: business.slug, order: order.order_id! }).url}
                                                            className="text-sm font-semibold text-brand hover:underline"
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Pagination */}
                                    {(orders.prev_page_url || orders.next_page_url) && (
                                        <div className="flex justify-between border-t border-site-border px-5 py-3">
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Block / Unblock confirmation */}
            <AlertDialog open={blockOpen} onOpenChange={setBlockOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {customer.is_blocked ? `Unblock ${customer.name}?` : `Block ${customer.name}?`}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {customer.is_blocked
                                ? 'This customer will be able to log in and place orders again.'
                                : 'This customer will be prevented from logging in or placing new orders.'
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBlock}
                            disabled={blockProcessing}
                            className={customer.is_blocked
                                ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600'
                                : 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-600'
                            }
                        >
                            {blockProcessing && <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                            {customer.is_blocked ? 'Unblock' : 'Block'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppSidebarLayout>
    );
}
