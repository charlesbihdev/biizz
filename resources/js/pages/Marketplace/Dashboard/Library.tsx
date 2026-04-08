import { Head, Link } from '@inertiajs/react';
import { BookOpen, Sparkles, Search } from 'lucide-react';
import BuyerDashboardLayout from '@/layouts/marketplace/buyer-dashboard-layout';
import { index as marketplaceIndex } from '@/routes/marketplace';
import type { MarketplacePurchase, PaginatedData } from '@/types';
import AnalyticsRow from './Components/Library/AnalyticsRow';
import FilterBar from './Components/Library/FilterBar';
import PurchaseCard from './Components/Library/PurchaseCard';

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
    const hasActiveFilters = filters.search || filters.status || filters.category;

    return (
        <BuyerDashboardLayout active="library" stats={stats}>
            <Head title="My Library — biizz.market" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-site-fg lg:text-4xl">
                        My <span className="text-brand">Library</span>
                    </h1>
                    <p className="mt-2 max-w-lg text-sm font-medium text-site-muted">
                        Access and manage all your purchased digital products, courses, and e-books in one place.
                    </p>
                </div>
                
                <Link
                    href={marketplaceIndex().url}
                    className="group flex items-center gap-2 self-start rounded-2xl bg-white px-5 py-3 text-xs font-black text-site-fg shadow-sm ring-1 ring-site-border transition-all hover:bg-zinc-50 hover:shadow-md lg:self-auto"
                >
                    <Sparkles className="h-4 w-4 text-brand transition-transform group-hover:rotate-12" />
                    Browse Marketplace
                </Link>
            </div>

            {/* Analytics Summary */}
            <AnalyticsRow stats={stats} />

            {/* Action Bar: Search & Filter */}
            <FilterBar filters={filters} />

            {/* Content Grid */}
            {purchases.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-site-border bg-white/50 py-24 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50 ring-8 ring-zinc-50/50">
                        {hasActiveFilters ? (
                            <Search className="h-8 w-8 text-zinc-300" />
                        ) : (
                            <BookOpen className="h-8 w-8 text-zinc-300" />
                        )}
                    </div>
                    <h3 className="mt-6 text-xl font-black text-site-fg">
                        {hasActiveFilters ? 'No matches found' : 'Your library is empty'}
                    </h3>
                    <p className="mt-2 max-w-xs text-sm font-medium text-site-muted">
                        {hasActiveFilters 
                            ? 'Try adjusting your search or filters to find what you are looking for.' 
                            : 'Explore our marketplace to discover amazing digital products from creators worldwide.'}
                    </p>
                    
                    {!hasActiveFilters && (
                        <Link
                            href={marketplaceIndex().url}
                            className="mt-8 flex items-center gap-2 rounded-2xl bg-brand px-8 py-3.5 text-xs font-black text-white shadow-xl shadow-brand/20 transition-all hover:bg-brand-hover hover:shadow-brand/30"
                        >
                            Explore Marketplace
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {purchases.data.map((p) => (
                            <PurchaseCard key={p.id} purchase={p} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {purchases.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-site-border pt-8">
                            <p className="text-xs font-bold text-site-muted uppercase">
                                Page <span className="text-site-fg">{purchases.current_page}</span> of {purchases.last_page}
                            </p>
                            <div className="flex gap-2">
                                {purchases.prev_page_url && (
                                    <Link 
                                        href={purchases.prev_page_url} 
                                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-site-border bg-white px-6 text-xs font-black text-site-fg shadow-sm transition-all hover:bg-zinc-50 hover:shadow-md active:scale-95"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {purchases.next_page_url && (
                                    <Link 
                                        href={purchases.next_page_url} 
                                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-site-border bg-white px-6 text-xs font-black text-site-fg shadow-sm transition-all hover:bg-zinc-50 hover:shadow-md active:scale-95"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </BuyerDashboardLayout>
    );
}
