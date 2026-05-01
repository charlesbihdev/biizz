import { Link, router } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { CustomerFilters } from '@/components/admin/customers/CustomerFilters';
import type { CustomerFiltersState } from '@/components/admin/customers/CustomerFilters';
import { CustomerStatsRow } from '@/components/admin/customers/CustomerStatsRow';
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
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show as businessShow } from '@/routes/businesses';
import { block, index, show } from '@/routes/businesses/customers';
import type { Business, Customer, CustomerStats, PaginatedData } from '@/types';

type CustomerRow = Customer & {
    orders_count: number;
    orders_sum_total: string | null;
};

type Props = {
    business: Business;
    customers: PaginatedData<CustomerRow>;
    filters: CustomerFiltersState;
    stats?: CustomerStats;
};

export default function CustomersIndex({ business, customers, filters, stats }: Props) {
    const b = { business: business.slug };
    const [blocking, setBlocking] = useState<CustomerRow | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleBlock = () => {
        if (!blocking) return;
        setProcessing(true);
        router.patch(block({ business: business.slug, customer: blocking.id }).url, {}, {
            onFinish: () => {
                setProcessing(false);
                setBlocking(null);
            },
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: businessShow(b).url },
                { title: 'Customers', href: index(b).url },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-site-fg">Customers</h1>
                    <p className="mt-0.5 text-sm text-site-muted">{customers.total} total</p>
                </div>

                <CustomerStatsRow stats={stats} filters={filters} />

                <CustomerFilters indexUrl={index(b).url} filters={filters} />

                {customers.data.length === 0 ? (
                    <div className="rounded-2xl border border-site-border bg-site-surface p-12 text-center">
                        <Users className="mx-auto mb-3 h-8 w-8 text-site-muted" />
                        <p className="text-sm font-medium text-site-fg">No customers found</p>
                        <p className="mt-1 text-xs text-site-muted">
                            Customers appear here once they place an order or register on your store.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-site-border bg-white">
                        <table className="min-w-180 w-full text-left">
                            <thead>
                                <tr className="border-b border-site-border bg-site-surface">
                                    <th className="py-2.5 pl-4 pr-3 text-xs font-semibold uppercase tracking-wide text-site-muted">#</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Customer</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Phone</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Orders</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Total Spent</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Joined</th>
                                    <th className="py-2.5 pl-3 pr-4" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-site-border">
                                {customers.data.map((customer, i) => (
                                    <tr key={customer.id} className="transition-colors hover:bg-site-surface/50">
                                        <td className="py-3 pl-4 pr-3 text-xs tabular-nums text-site-muted">
                                            {(customers.current_page - 1) * customers.per_page + i + 1}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <p className="text-sm font-medium text-site-fg">{customer.name}</p>
                                                    <p className="text-xs text-site-muted">{customer.email ?? '—'}</p>
                                                </div>
                                                {customer.is_blocked && (
                                                    <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                                        Blocked
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-site-fg">
                                            {customer.phone ?? <span className="text-site-muted">—</span>}
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="inline-flex rounded-full bg-site-surface px-2.5 py-0.5 text-xs font-semibold text-site-fg">
                                                {customer.orders_count}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-sm font-semibold text-site-fg">
                                            {customer.orders_sum_total
                                                ? `GHS ${parseFloat(customer.orders_sum_total).toFixed(2)}`
                                                : <span className="font-normal text-site-muted">—</span>
                                            }
                                        </td>
                                        <td className="px-3 py-3 text-xs text-site-muted">
                                            {new Date(customer.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 pl-3 pr-4">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={show({ business: business.slug, customer: customer.id }).url}
                                                    className="text-sm font-semibold text-brand hover:underline"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setBlocking(customer)}
                                                    className={`rounded-lg p-1.5 text-xs font-medium transition ${
                                                        customer.is_blocked
                                                            ? 'text-emerald-600 hover:bg-emerald-50'
                                                            : 'text-amber-600 hover:bg-amber-50'
                                                    }`}
                                                >
                                                    {customer.is_blocked ? 'Unblock' : 'Block'}
                                                </button>
                                                {/* <button
                                                    type="button"
                                                    onClick={() => setDeleting(customer)}
                                                    className="rounded-lg p-1.5 text-site-muted transition hover:bg-red-50 hover:text-red-600"
                                                    aria-label="Delete customer"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                    </svg>
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {(customers.prev_page_url || customers.next_page_url) && (
                    <div className="mt-4 flex justify-between">
                        <Link
                            href={customers.prev_page_url ?? '#'}
                            className={`text-sm font-medium ${customers.prev_page_url ? 'text-brand hover:underline' : 'pointer-events-none text-site-muted'}`}
                        >
                            ← Previous
                        </Link>
                        <span className="text-sm text-site-muted">Page {customers.current_page} of {customers.last_page}</span>
                        <Link
                            href={customers.next_page_url ?? '#'}
                            className={`text-sm font-medium ${customers.next_page_url ? 'text-brand hover:underline' : 'pointer-events-none text-site-muted'}`}
                        >
                            Next →
                        </Link>
                    </div>
                )}
            </div>

            {/* Block / Unblock confirmation */}
            <AlertDialog open={!!blocking} onOpenChange={(open) => { if (!open) setBlocking(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {blocking?.is_blocked ? `Unblock ${blocking?.name}?` : `Block ${blocking?.name}?`}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {blocking?.is_blocked
                                ? 'This customer will be able to log in and place orders again.'
                                : 'This customer will be prevented from logging in or placing new orders.'
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBlock}
                            disabled={processing}
                            className={blocking?.is_blocked
                                ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600'
                                : 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-600'
                            }
                        >
                            {blocking?.is_blocked ? 'Unblock' : 'Block'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppSidebarLayout>
    );
}
