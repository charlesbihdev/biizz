import ClassicThemeShell from '../ThemeShell';
import ClassicProductDetailPage from './ProductDetailPage';
import type { Business, Page, Product } from '@/types/business';

interface Props {
    business: Business;
    product:  Product;
    related:  Product[];
    pages:    Page[];
}

export default function ProductPage({ business, product, related, pages }: Props) {
    const { theme_settings: s } = business;
    const primary = s.primary_color ?? '#1a1a1a';
    const accent  = s.accent_color  ?? primary;

    return (
        <ClassicThemeShell business={business} pages={pages}>
            {({ addToCart, trackEvent }) => (
                <ClassicProductDetailPage
                    businessSlug={business.slug}
                    product={product}
                    related={related}
                    primaryColor={primary}
                    accentColor={accent}
                    isDigital={business.business_type === 'digital'}
                    onAddToCart={(item) => {
                        addToCart(item);
                        trackEvent('AddToCart', { content_name: item.name, value: item.price, currency: 'GHS' });
                    }}
                />
            )}
        </ClassicThemeShell>
    );
}
