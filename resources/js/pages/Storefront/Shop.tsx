import ClassicThemeShell from '@/Themes/Classic/ThemeShell';
import BoutiqueThemeShell from '@/Themes/Boutique/ThemeShell';
import ClassicShopPage from '@/Themes/Classic/Components/ShopPage';
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
    const head = <StorefrontHead business={business} title="Shop" />;

    if (business.theme_id === 'boutique') {
        return (
            <>
                {head}
                <BoutiqueThemeShell business={business} pages={pages}>
                    {({ addToCart, trackEvent }) => (
                        <ClassicShopPage
                            business={business}
                            products={products}
                            priceRange={priceRange}
                            filters={filters}
                            onAddToCart={(item) => {
                                addToCart(item);
                                trackEvent('AddToCart', { content_name: item.name, value: item.price, currency: 'GHS' });
                            }}
                        />
                    )}
                </BoutiqueThemeShell>
            </>
        );
    }

    return (
        <>
            {head}
            <ClassicThemeShell business={business} pages={pages}>
                {({ addToCart, trackEvent }) => (
                    <ClassicShopPage
                        business={business}
                        products={products}
                        priceRange={priceRange}
                        filters={filters}
                        onAddToCart={(item) => {
                            addToCart(item);
                            trackEvent('AddToCart', { content_name: item.name, value: item.price, currency: 'GHS' });
                        }}
                    />
                )}
            </ClassicThemeShell>
        </>
    );
}
