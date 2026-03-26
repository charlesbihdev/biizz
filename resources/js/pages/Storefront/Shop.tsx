import { Suspense } from 'react';
import { THEME_MAP } from '@/types/theme';
import StorefrontHead from '@/Themes/Shared/StorefrontHead';
import type { Business, Page, PaginatedData, Product } from '@/types/business';

type Filters = {
    category:  string | null;
    min_price: string | null;
    max_price: string | null;
    in_stock:  boolean;
    sort:      string;
    q:         string | null;
};

type Props = {
    business:   Business;
    products:   PaginatedData<Product>;
    pages:      Page[];
    priceRange: { min: number; max: number };
    filters:    Filters;
};

export default function StorefrontShop({ business, products, pages, priceRange, filters }: Props) {
    const Shop = THEME_MAP[business.theme_id as keyof typeof THEME_MAP]?.Shop;

    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-zinc-400">Loading...</div>}>
            <StorefrontHead business={business} title="Shop" />
            <Shop business={business} products={products} pages={pages} priceRange={priceRange} filters={filters} />
        </Suspense>
    );
}
