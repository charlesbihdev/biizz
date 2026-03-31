import { router } from '@inertiajs/react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import type { Business, CartItem, PaginatedData, Product } from '@/types/business';
import { shop } from '@/actions/App/Http/Controllers/StorefrontController';
import Pagination from '../Common/Pagination';
import ProductCard from '../Common/ProductCard';
import FilterPanel from './FilterPanel';

type Filters = {
    category:  string | null;
    min_price: string | null;
    max_price: string | null;
    in_stock:  boolean;
    sort:      string;
    q:         string | null;
};

interface Props {
    business:   Business;
    products:   PaginatedData<Product>;
    priceRange: { min: number; max: number };
    filters:    Filters;
    onAddToCart: (item: CartItem) => void;
}

const SORT_OPTIONS = [
    { value: 'newest',     label: 'Newest first' },
    { value: 'price_asc',  label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc',   label: 'A – Z' },
];

export default function ClassicShopPage({ business, products, priceRange, filters, onAddToCart }: Props) {
    const { theme_settings: s, slug, categories = [], business_type } = business;
    const primary    = s.primary_color ?? '#1a1a1a';
    const accent     = s.accent_color  ?? primary;
    const textMuted  = primary + '80'; // 50% opacity
    const isDigital  = business_type === 'digital';

    const [drawerOpen, setDrawerOpen] = useState(false);

    // Local draft filter state (applied on submit)
    const [draft, setDraft] = useState<Filters>({ ...filters });

    const applyFilters = (overrides: Partial<Filters> = {}) => {
        const merged = { ...draft, ...overrides };
        const query: Record<string, string> = {};
        if (merged.category)                          { query.category  = merged.category; }
        if (merged.min_price)                         { query.min_price = merged.min_price; }
        if (merged.max_price)                         { query.max_price = merged.max_price; }
        if (merged.in_stock)                          { query.in_stock  = '1'; }
        if (merged.sort && merged.sort !== 'newest')  { query.sort      = merged.sort; }
        if (merged.q)                                 { query.q         = merged.q; }

        router.visit(shop.url(slug, { query: Object.keys(query).length > 0 ? query : undefined }), {
            preserveScroll: false,
        });
        setDrawerOpen(false);
    };

    const clearFilters = () => {
        const cleared: Filters = { category: null, min_price: null, max_price: null, in_stock: false, sort: 'newest', q: null };
        setDraft(cleared);
        router.visit(shop.url(slug), { preserveScroll: false });
        setDrawerOpen(false);
    };

    const activeFilterCount = [
        draft.category, draft.min_price, draft.max_price, draft.in_stock, draft.q,
        draft.sort !== 'newest',
    ].filter(Boolean).length;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* ── Page header ── */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold" style={{ color: primary }}>Shop</h1>
                <p className="text-sm" style={{ color: textMuted }}>{products.total} product{products.total !== 1 ? 's' : ''}</p>
            </div>

            <div className="flex gap-8">
                {/* ── Sidebar (desktop) ── */}
                <aside className="hidden w-56 shrink-0 lg:block">
                    <FilterPanel
                        draft={draft}
                        setDraft={setDraft}
                        categories={categories}
                        priceRange={priceRange}
                        isDigital={isDigital}
                        accent={accent}
                        primary={primary}
                        onApply={() => applyFilters()}
                        onClear={clearFilters}
                    />
                </aside>

                {/* ── Main content ── */}
                <div className="min-w-0 flex-1">
                    {/* Sort bar + mobile filter button */}
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            className="flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:border-zinc-300 lg:hidden"
                            style={{ color: primary }}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                        </button>

                        <div className="ml-auto flex items-center gap-2 text-sm">
                            <span className="hidden sm:inline" style={{ color: textMuted }}>Sort by</span>
                            <select
                                value={draft.sort}
                                onChange={(e) => { const s = e.target.value; setDraft((d) => ({ ...d, sort: s })); applyFilters({ sort: s }); }}
                                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm focus:outline-none"
                                style={{ color: primary }}
                            >
                                {SORT_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Product grid */}
                    {products.data.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-200 py-20 text-center">
                            <p className="text-sm" style={{ color: textMuted }}>No products match your filters.</p>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-3 text-sm font-medium underline"
                                style={{ color: accent }}
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5">
                            {products.data.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={onAddToCart}
                                    accentColor={accent}
                                    primaryColor={primary}
                                    isDigital={isDigital}
                                    businessSlug={slug}
                                />
                            ))}
                        </div>
                    )}

                    <Pagination data={products} accentColor={accent} />
                </div>
            </div>

            {/* ── Mobile filter drawer ── */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
                    <div className="relative ml-auto flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                            <span className="font-semibold" style={{ color: primary }}>Filters</span>
                            <button
                                type="button"
                                onClick={() => setDrawerOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-100"
                                style={{ color: primary + 'b3' }}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 py-4">
                            <FilterPanel
                                draft={draft}
                                setDraft={setDraft}
                                categories={categories}
                                priceRange={priceRange}
                                isDigital={isDigital}
                                accent={accent}
                                primary={primary}
                                onApply={() => applyFilters()}
                                onClear={clearFilters}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
