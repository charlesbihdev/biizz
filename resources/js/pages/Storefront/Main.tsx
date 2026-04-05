import { Suspense } from 'react';
import { THEME_MAP } from '@/types/theme';
import StorefrontHead from '@/Themes/Shared/StorefrontHead';
import type { Business, Page, PaginatedData, Product } from '@/types/business';

type Props = {
    business:          Business;
    products?:         PaginatedData<Product>;
    featured_product?: Product | null;
    pages:             Page[];
    isPreview?:        boolean;
};

export default function StorefrontMain({ business, products, featured_product, pages, isPreview = false }: Props) {
    const Theme = THEME_MAP[business.theme_id as keyof typeof THEME_MAP];
    const Layout = Theme?.Layout;

    return (
        <Suspense fallback={null}>
            <StorefrontHead business={business} />
            {isPreview && (
                <div className="fixed inset-x-0 top-0 z-50 bg-amber-500 py-1.5 text-center text-xs font-semibold text-white">
                    Preview mode — changes are not saved
                </div>
            )}
            <Layout business={business} products={products} featured_product={featured_product} pages={pages} />
        </Suspense>
    );
}
