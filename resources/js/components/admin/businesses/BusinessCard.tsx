import { Link } from '@inertiajs/react';
import { Package, ShoppingBag } from 'lucide-react';
import { show } from '@/routes/businesses';
import type { Business } from '@/types';

type BusinessWithCounts = Business & {
    products_count: number;
    orders_count: number;
};

export function BusinessCard({ business }: { business: BusinessWithCounts }) {
    const initial = business.name[0].toUpperCase();

    return (
        <div className="flex flex-col rounded-2xl border border-site-border bg-white p-6 transition hover:shadow-sm">
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-black text-white">
                    {initial}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-site-fg">{business.name}</p>
                    <p className="truncate text-xs text-site-muted">biizz.app/s/{business.slug}</p>
                </div>
            </div>

            {/* Stats row */}
            <div className="mb-6 flex gap-4">
                <div className="flex items-center gap-1.5 text-sm text-site-muted">
                    <Package className="h-3.5 w-3.5 text-brand" />
                    <span className="font-semibold text-site-fg">{business.products_count}</span>
                    <span>products</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-site-muted">
                    <ShoppingBag className="h-3.5 w-3.5 text-brand" />
                    <span className="font-semibold text-site-fg">{business.orders_count}</span>
                    <span>orders</span>
                </div>
            </div>

            {/* CTA */}
            <Link
                href={show({ business: business.slug }).url}
                className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
            >
                Manage <span aria-hidden>→</span>
            </Link>
        </div>
    );
}
