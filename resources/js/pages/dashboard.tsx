import { usePage } from '@inertiajs/react';
import { Package, ShoppingBag, Store, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { CreateBusinessModal } from '@/components/admin/businesses/CreateBusinessModal';
import { BusinessCard } from '@/components/admin/businesses/BusinessCard';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { Auth, Business } from '@/types';

type BusinessWithCounts = Business & {
    products_count: number;
    orders_count: number;
};

type Props = {
    businesses: BusinessWithCounts[];
};

export default function Dashboard({ businesses }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [createOpen, setCreateOpen] = useState(false);

    if (!auth.user) {
        return null;
    }

    const firstName = auth.user.name.split(' ')[0];

    const totalProducts = businesses.reduce((sum, b) => sum + b.products_count, 0);
    const totalOrders = businesses.reduce((sum, b) => sum + b.orders_count, 0);

    const stats = [
        { label: 'Businesses', value: String(businesses.length), icon: Store },
        { label: 'Products',   value: String(totalProducts),     icon: Package },
        { label: 'Orders',     value: String(totalOrders),       icon: ShoppingBag },
        { label: 'Revenue',    value: 'GHS 0',                   icon: TrendingUp },
    ];

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <div className="p-6 lg:p-8">

                {/* Page heading */}
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-site-fg">
                            Welcome back, {firstName}
                        </h1>
                        <p className="mt-1 text-sm text-site-muted">
                            Here's what's happening across your businesses.
                        </p>
                    </div>
                    {businesses.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="shrink-0 rounded-full bg-brand px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-hover"
                        >
                            + New business
                        </button>
                    )}
                </div>

                {/* Stats bar */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {stats.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-xl border border-site-border bg-white p-5">
                            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dim">
                                <Icon className="h-4 w-4 text-brand" />
                            </div>
                            <p className="text-2xl font-bold text-site-fg">{value}</p>
                            <p className="mt-0.5 text-xs text-site-muted">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Business grid or empty state */}
                {businesses.length === 0 ? (
                    <div className="rounded-2xl border border-site-border bg-site-surface p-12 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-dim">
                            <Store className="h-6 w-6 text-brand" />
                        </div>
                        <h3 className="text-xl font-bold text-site-fg">No businesses yet</h3>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-site-muted">
                            Create your first business and start selling in minutes. No plugins, no complexity.
                        </p>
                        <button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3 text-sm font-bold text-white transition hover:bg-brand-hover"
                        >
                            Create a business
                            <span aria-hidden>→</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {businesses.map((business) => (
                            <BusinessCard key={business.id} business={business} />
                        ))}
                    </div>
                )}
            </div>

            <CreateBusinessModal open={createOpen} onOpenChange={setCreateOpen} />
        </AppSidebarLayout>
    );
}
