import ClassicThemeShell from '@/Themes/Classic/ThemeShell';
import BoutiqueThemeShell from '@/Themes/Boutique/ThemeShell';
import ClassicProductDetailPage from '@/Themes/Classic/Components/ProductDetailPage';
import BoutiqueProductDetailPage from '@/Themes/Boutique/Components/ProductDetailPage';
import StorefrontHead from '@/Themes/Shared/StorefrontHead';
import type { Business, Page, Product } from '@/types/business';

function stripHtml(html: string | null | undefined): string {
    if (!html) { return ''; }
    return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 155);
}

type Props = {
    business: Business;
    product:  Product;
    related:  Product[];
    pages:    Page[];
};

export default function StorefrontProduct({ business, product, related, pages }: Props) {
    const { theme_settings: s } = business;
    const isDigital         = business.business_type === 'digital';
    const productDescription = stripHtml(product.description);
    const productImage      = product.images[0]?.url;

    const head = (
        <StorefrontHead
            business={business}
            title={product.name}
            description={productDescription || undefined}
            image={productImage}
        />
    );

    if (business.theme_id === 'boutique') {
        return (
            <>
                {head}
                <BoutiqueThemeShell business={business} pages={pages}>
                    {({ addToCart, trackEvent }) => (
                        <BoutiqueProductDetailPage
                            businessSlug={business.slug}
                            product={product}
                            related={related}
                            accentColor={s.accent_color}
                            isDigital={isDigital}
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
                    <ClassicProductDetailPage
                        businessSlug={business.slug}
                        product={product}
                        related={related}
                        primaryColor={s.primary_color}
                        accentColor={s.accent_color ?? s.primary_color}
                        isDigital={isDigital}
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
