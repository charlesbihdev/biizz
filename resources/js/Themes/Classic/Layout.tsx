import { router } from '@inertiajs/react';
import type { Business, PaginatedData, Page, Product } from '@/types/business';
import ClassicThemeShell from './ThemeShell';
import CategoryFilter from './Components/CategoryFilter';
import HeroSection from './Components/HeroSection';
import Pagination from './Components/Common/Pagination';
import ProductGrid from './Components/ProductGrid';

interface Props {
    business: Business;
    products: PaginatedData<Product>;
    pages:    Page[];
}

export default function ClassicLayout({ business, products, pages }: Props) {
    const { theme_settings: s } = business;
    const categories = business.categories ?? [];

    const activeCategorySlug = new URLSearchParams(window.location.search).get('category') ?? null;

    const handleCategoryChange = (slug: string | null) => {
        const url = new URL(window.location.href);
        if (slug === null) {
            url.searchParams.delete('category');
        } else {
            url.searchParams.set('category', slug);
        }
        url.searchParams.delete('page');
        router.visit(url.pathname + url.search, { preserveScroll: false });
    };

    const activeCategory = categories.find((c) => c.slug === activeCategorySlug) ?? null;

    return (
        <ClassicThemeShell business={business} pages={pages}>
            {({ addToCart, trackEvent, tokens }) => (
                <>
                    {s.show_hero !== false && <HeroSection business={business} />}

                    <CategoryFilter
                        categories={categories}
                        activeSlug={activeCategorySlug}
                        onChange={handleCategoryChange}
                        tokens={tokens}
                    />

                    <ProductGrid
                        products={products.data}
                        onAddToCart={(item) => {
                            addToCart(item);
                            trackEvent('AddToCart', { content_name: item.name, value: item.price, currency: 'GHS' });
                        }}
                        tokens={tokens}
                        activeCategory={activeCategory}
                        isDigital={business.business_type === 'digital'}
                        businessSlug={business.slug}
                    />

                    <Pagination data={products} tokens={tokens} />
                </>
            )}
        </ClassicThemeShell>
    );
}
