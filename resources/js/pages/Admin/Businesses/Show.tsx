import { router } from '@inertiajs/react';
import { DollarSign, ExternalLink, LoaderCircle, Package, ShoppingBag, Trash2, TrendingUp } from 'lucide-react';
import { useState } from 'react';
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
import { OverviewBillingBanner } from '@/components/admin/billing/OverviewBillingBanner';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { destroy, show, toggle } from '@/routes/businesses';
import type { Business } from '@/types';

type BusinessWithCounts = Business & {
    products_count: number;
    orders_count: number;
    is_active: boolean;
};

export default function ShowBusiness({ business }: { business: BusinessWithCounts }) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [toggling,   setToggling]   = useState(false);
    const [deleting,   setDeleting]   = useState(false);
    const b = { business: business.slug };

    const handleToggle = () => {
        setToggling(true);
        router.patch(toggle(b).url, {}, {
            preserveScroll: true,
            onFinish: () => setToggling(false),
        });
    };

    const handleDelete = () => {
        setDeleting(true);
        router.visit(destroy(b).url, {
            method: 'delete',
            onFinish: () => setDeleting(false),
        });
    };

    const stats = [
        { label: 'Total Revenue', value: '—',  sub: 'coming soon',  icon: DollarSign, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
        { label: 'Orders',        value: business.orders_count.toString(),  sub: 'all time',     icon: ShoppingBag, iconBg: 'bg-blue-50',    iconColor: 'text-blue-600' },
        { label: 'Products',      value: business.products_count.toString(), sub: 'in catalogue', icon: Package,     iconBg: 'bg-brand-dim',  iconColor: 'text-brand' },
        { label: 'Conversion',    value: '—',  sub: 'coming soon',  icon: TrendingUp,  iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    ];

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: show(b).url },
                { title: 'Overview', href: '#' },
            ]}
        >
            <div className="p-6 lg:p-8">

                <OverviewBillingBanner />

                {/* ── Storefront status banner ── */}
                <div className={`mb-8 flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 ${
                    business.is_active
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-amber-200 bg-amber-50'
                }`}>
                    <div className="flex items-center gap-3">
                        <span className={`flex h-2.5 w-2.5 rounded-full ${
                            business.is_active ? 'animate-pulse bg-emerald-500' : 'bg-amber-400'
                        }`} />
                        <div>
                            <p className={`text-sm font-semibold ${business.is_active ? 'text-emerald-800' : 'text-amber-800'}`}>
                                {business.is_active
                                    ? (business.business_type === 'digital' ? 'Creator catalog is live' : 'Storefront is live')
                                    : (business.business_type === 'digital' ? 'Creator catalog is offline' : 'Storefront is offline')
                                }
                            </p>
                            <a
                                href={business.business_type === 'digital' ? `/catalog/${business.slug}` : `/s/${business.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1 text-xs ${
                                    business.is_active ? 'text-emerald-700 hover:text-emerald-900' : 'text-amber-700'
                                }`}
                                onClick={(e) => { if (!business.is_active) { e.preventDefault(); } }}
                            >
                                {business.business_type === 'digital'
                                    ? `biizz.app/catalog/${business.slug}`
                                    : `biizz.app/s/${business.slug}`
                                }
                                {business.is_active && <ExternalLink className="h-3 w-3" />}
                            </a>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleToggle}
                        disabled={toggling}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition disabled:opacity-60 ${
                            business.is_active
                                ? 'bg-white text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-700 hover:text-white hover:ring-emerald-700'
                                : 'bg-amber-500 text-white hover:bg-amber-600'
                        }`}
                    >
                        {toggling && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
                        {business.is_active ? 'Take offline' : 'Go live'}
                    </button>
                </div>

                {/* ── Stat cards ── */}
                <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
                        <div key={label} className="rounded-2xl border border-site-border bg-white p-5">
                            <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
                                <Icon className={`h-4 w-4 ${iconColor}`} />
                            </div>
                            <p className="text-2xl font-bold tracking-tight text-site-fg">{value}</p>
                            <p className="mt-0.5 text-xs font-medium text-site-muted">{label}</p>
                            <p className="text-[11px] text-site-muted/60">{sub}</p>
                        </div>
                    ))}
                </div>

                {/* ── Danger zone ── */}
                {business.orders_count === 0 && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                        <p className="mb-1 text-sm font-semibold text-red-700">Danger zone</p>
                        <p className="mb-4 text-xs text-red-600">
                            Permanently delete this business and all its data. This cannot be undone.
                        </p>
                        <button
                            type="button"
                            onClick={() => setDeleteOpen(true)}
                            className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete business
                        </button>
                    </div>
                )}
            </div>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{business.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the business, all its products, and settings. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 disabled:opacity-60"
                        >
                            {deleting && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
                            Delete business
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppSidebarLayout>
    );
}
