/**
 * TEMPORARY Boutique theme registry.
 *
 * Replicates the old if/else resolver behavior so Boutique keeps working
 * after the Classic refactor. Pages Boutique doesn't own yet (Contact, Page,
 * Checkout) fall back to Classic versions (with Classic shell).
 *
 * Replace this entire file when Boutique is properly refactored.
 */
import Layout from './Layout';
import BoutiqueThemeShell from './ThemeShell';
import BoutiqueProductDetailPage from './Components/ProductDetailPage';
import ClassicShopPage from '@/Themes/Classic/Components/ShopPage';
import ClassicCheckout from '@/Themes/Classic/Components/Checkout';
import ClassicContactPage from '@/Themes/Classic/Components/ContactPage';
import ClassicContentPage from '@/Themes/Classic/Components/ContentPage';
import type { Business, CartItem, Page, PaginatedData, Product } from '@/types/business';

// --- Temporary wrappers for pages Boutique partially owns ---

function BoutiqueShop({ business, products, pages, priceRange, filters }: {
    business: Business; products: PaginatedData<Product>; pages: Page[];
    priceRange: { min: number; max: number };
    filters: { category: string | null; min_price: string | null; max_price: string | null; in_stock: boolean; sort: string; q: string | null };
}) {
    return (
        <BoutiqueThemeShell business={business} pages={pages}>
            {({ addToCart, trackEvent }) => (
                <ClassicShopPage
                    business={business}
                    products={products}
                    priceRange={priceRange}
                    filters={filters}
                    onAddToCart={(item: CartItem) => {
                        addToCart(item);
                        trackEvent('AddToCart', { content_name: item.name, value: item.price, currency: 'GHS' });
                    }}
                />
            )}
        </BoutiqueThemeShell>
    );
}

function BoutiqueProduct({ business, product, related, pages }: {
    business: Business; product: Product; related: Product[]; pages: Page[];
}) {
    const { theme_settings: s } = business;
    return (
        <BoutiqueThemeShell business={business} pages={pages}>
            {({ addToCart, trackEvent }) => (
                <BoutiqueProductDetailPage
                    businessSlug={business.slug}
                    product={product}
                    related={related}
                    accentColor={s.accent_color}
                    isDigital={business.business_type === 'digital'}
                    onAddToCart={(item: CartItem) => {
                        addToCart(item);
                        trackEvent('AddToCart', { content_name: item.name, value: item.price, currency: 'GHS' });
                    }}
                />
            )}
        </BoutiqueThemeShell>
    );
}

export default {
    Layout,
    Shop:     BoutiqueShop,
    Product:  BoutiqueProduct,
    // Temporary: these use Classic versions until Boutique is properly built
    Checkout: ClassicCheckout,
    Contact:  ClassicContactPage,
    Page:     ClassicContentPage,
};
