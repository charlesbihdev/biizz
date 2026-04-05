import FunnelThemeShell, { type CartActions } from '../ThemeShell';
import FunnelNav from '../Components/FunnelNav';
import FunnelFooter from '../Components/FunnelFooter';
import ClassicShopPage from '@/Themes/Classic/Components/Shop/ShopPage';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';
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

function ShopContent({
    business,
    products,
    pages,
    priceRange,
    filters,
    cartActions,
}: Props & { cartActions: CartActions }) {
    const { isAuthenticated, loginMode, customer } = useCustomerAuth();
    const accent = (business.theme_settings.accent_color as string | undefined) || '#6366f1';

    return (
        <div className="min-h-screen bg-white">
            <FunnelNav
                business={business}
                pages={pages}
                accent={accent}
                loginMode={loginMode}
                isAuthenticated={isAuthenticated}
                customer={customer}
                onAuthClick={cartActions.openAuth}
            />

            <div className="pt-16">
                <ClassicShopPage
                    business={business}
                    products={products}
                    priceRange={priceRange}
                    filters={filters}
                    onAddToCart={(item) => {
                        cartActions.addToCart(item);
                        cartActions.trackEvent('AddToCart', {
                            content_name: item.name,
                            value:        item.price,
                            currency:     'GHS',
                        });
                    }}
                />
            </div>

            <FunnelFooter business={business} pages={pages} />
        </div>
    );
}

export default function ShopPage({ business, products, pages, priceRange, filters }: Props) {
    return (
        <FunnelThemeShell business={business} pages={pages}>
            {(cartActions) => (
                <ShopContent
                    business={business}
                    products={products}
                    pages={pages}
                    priceRange={priceRange}
                    filters={filters}
                    cartActions={cartActions}
                />
            )}
        </FunnelThemeShell>
    );
}
