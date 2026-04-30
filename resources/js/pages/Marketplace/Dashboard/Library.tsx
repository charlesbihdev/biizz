import { Head, Link } from '@inertiajs/react';
import { BookOpen, Sparkles, Search, LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';
import BuyerDashboardLayout from '@/layouts/marketplace/buyer-dashboard-layout';
import { index as marketplaceIndex } from '@/routes/marketplace';
import type { MarketplacePurchase, PaginatedData } from '@/types';
import AnalyticsRow from './Components/Library/AnalyticsRow';
import FilterBar from './Components/Library/FilterBar';
import PurchaseCard from './Components/Library/PurchaseCard';
import PurchaseHistoryList from './Components/Library/PurchaseHistoryList';
import { cn } from '@/lib/utils';

type BuyerStats = {
    purchase_count: number;
    total_spent: string;
    pending_count: number;
    member_since: string;
    digital_assets: number;
};

type PurchaseWithProduct = MarketplacePurchase & {
    product: {
        id: number;
        name: string;
        slug: string;
        digital_category: string | null;
        price: string;
        images: { url: string }[];
        business: { name: string; slug: string };
        files: { id: number }[];
    };
};

interface Props {
    purchases: PaginatedData<PurchaseWithProduct>;
    stats: BuyerStats;
    filters: { search?: string; status?: string; category?: string };
}

export default function Library({ purchases, stats, filters }: Props) {
    const [view, setView] = useState<'grid' | 'history'>('grid');
    const hasActiveFilters = filters.search || filters.status || filters.category;
    const isEmpty = purchases.data.length === 0;

    return (
        <BuyerDashboardLayout active="library" stats={stats}>
            <Head title="My Library — biizz.market" />

            {/* Header */}
            <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-site-fg lg:text-4xl">
                        My <span className="text-brand">Library</span>
                    </h1>
                    <p className="mt-1.5 text-sm font-medium text-site-muted">
                        All your purchased digital products in one place.
                    </p>
                </div>

                <div className="flex items-center gap-3 self-start lg:self-auto">
                    {/* View toggle */}
                    {!isEmpty && (
                        <div className="flex items-center rounded-xl border border-site-border bg-white p-1 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setView('grid')}
                                title="Grid view"
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                                    view === 'grid'
                                        ? 'bg-site-ink text-white shadow-sm'
                                        : 'text-site-muted hover:text-site-fg'
                                )}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('history')}
                                title="Purchase history"
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                                    view === 'history'
                                        ? 'bg-site-ink text-white shadow-sm'
                                        : 'text-site-muted hover:text-site-fg'
                                )}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <Link
                        href={marketplaceIndex().url}
                        className="group flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-site-fg shadow-sm ring-1 ring-site-border transition-all hover:bg-zinc-50 hover:shadow-md"
                    >
                        <Sparkles className="h-3.5 w-3.5 text-brand transition-transform group-hover:rotate-12" />
                        Browse Marketplace
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <AnalyticsRow stats={stats} />

            {/* View heading when in history mode */}
            {view === 'history' && !isEmpty && (
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-black text-site-fg">
                        Purchase History
                        <span className="ml-2 text-site-muted font-medium">
                            {purchases.total} transaction{purchases.total !== 1 ? 's' : ''}
                        </span>
                    </h2>
                </div>
            )}

            {/* Filter bar — show in grid mode or when there are active filters */}
            {(view === 'grid' || hasActiveFilters) && (
                <FilterBar filters={filters} />
            )}

            {/* Content */}
            {isEmpty ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-site-border bg-white/60 py-24 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 ring-8 ring-zinc-50/60">
                        {hasActiveFilters ? (
                            <Search className="h-7 w-7 text-zinc-300" />
                        ) : (
                            <BookOpen className="h-7 w-7 text-zinc-300" />
                        )}
                    </div>
                    <h3 className="mt-5 text-xl font-black text-site-fg">
                        {hasActiveFilters ? 'No matches found' : 'Your library is empty'}
                    </h3>
                    <p className="mt-2 max-w-xs text-sm font-medium text-site-muted">
                        {hasActiveFilters
                            ? 'Try adjusting your search or filters.'
                            : 'Explore the marketplace to discover digital products from creators worldwide.'}
                    </p>
                    {!hasActiveFilters && (
                        <Link
                            href={marketplaceIndex().url}
                            className="mt-7 flex items-center gap-2 rounded-xl bg-brand px-7 py-3 text-xs font-black text-white shadow-lg shadow-brand/20 transition hover:bg-brand-hover"
                        >
                            Explore Marketplace
                        </Link>
                    )}
                </div>
            ) : view === 'history' ? (
                <div className="space-y-6">
                    <PurchaseHistoryList purchases={purchases.data} />
                    <Pagination purchases={purchases} />
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {purchases.data.map((p) => (
                            <PurchaseCard key={p.id} purchase={p} />
                        ))}
                    </div>
                    <Pagination purchases={purchases} />
                </div>
            )}
        </BuyerDashboardLayout>
    );
}

function Pagination({ purchases }: { purchases: PaginatedData<PurchaseWithProduct> }) {
    if (purchases.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-site-border pt-6">
            <p className="text-xs font-bold text-site-muted">
                Page <span className="text-site-fg">{purchases.current_page}</span> of {purchases.last_page}
            </p>
            <div className="flex gap-2">
                {purchases.prev_page_url && (
                    <Link
                        href={purchases.prev_page_url}
                        className="inline-flex h-10 items-center rounded-xl border border-site-border bg-white px-5 text-xs font-black text-site-fg shadow-sm transition hover:bg-zinc-50 active:scale-95"
                    >
                        Previous
                    </Link>
                )}
                {purchases.next_page_url && (
                    <Link
                        href={purchases.next_page_url}
                        className="inline-flex h-10 items-center rounded-xl border border-site-border bg-white px-5 text-xs font-black text-site-fg shadow-sm transition hover:bg-zinc-50 active:scale-95"
                    >
                        Next
                    </Link>
                )}
            </div>
        </div>
    );
}
