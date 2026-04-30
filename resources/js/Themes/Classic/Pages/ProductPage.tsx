import ClassicThemeShell from '../ThemeShell';
import ClassicProductDetailPage from '../Components/ProductDetailPage';
import type { Business, Page, Product } from '@/types/business';

interface Props {
    business: Business;
    product:  Product;
    related:  Product[];
    pages:    Page[];
}

export default function ProductPage({ business, product, related, pages }: Props) {
    return (
        <ClassicThemeShell business={business} pages={pages}>
            {({ addToCart, trackEvent, tokens }) => (
                <ClassicProductDetailPage
                    businessSlug={business.slug}
                    product={product}
                    related={related}
                    tokens={tokens}
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
