import ClassicThemeShell from '../ThemeShell';
import ShopPage from '../Components/ShopPage';
import type { Business, Page, PaginatedData, Product } from '@/types/business';

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
    pages:      Page[];
    priceRange: { min: number; max: number };
    filters:    Filters;
}

export default function ShopPageFull({ business, products, pages, priceRange, filters }: Props) {
    return (
        <ClassicThemeShell business={business} pages={pages}>
            {({ addToCart, trackEvent }) => (
                <ShopPage
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
    );
}
