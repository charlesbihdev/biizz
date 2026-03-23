import type { Business, Product } from '@/types/business';
import { useCart } from '@/Themes/Shared/Hooks/useCart';
import { useMetaPixel } from '@/Themes/Shared/Hooks/useMetaPixel';
import HeroSection from './Components/HeroSection';
import ProductGrid from './Components/ProductGrid';
import StoreFooter from './Components/StoreFooter';
import CartDrawer from './Components/CartDrawer';

interface Props {
    business: Business;
    products: Product[];
}

export default function ClassicLayout({ business, products }: Props) {
    const { items, addToCart, removeFromCart, updateQuantity, total, itemCount } = useCart();
    const { trackEvent } = useMetaPixel(business.meta_pixel_id ?? '');

    const handleAddToCart = (item: Parameters<typeof addToCart>[0]) => {
        addToCart(item);
        trackEvent('AddToCart', { content_name: item.name, value: item.price, currency: 'GHS' });
    };

    // Track storefront view on mount
    // (ViewContent per product is handled inside ProductGrid on card click)

    return (
        <div className="min-h-screen bg-white font-sans antialiased">
            <HeroSection business={business} />

            <ProductGrid
                products={products}
                onAddToCart={handleAddToCart}
                primaryColor={business.theme_settings.primary_color}
            />

            {business.theme_settings.store_description && (
                <section className="bg-zinc-50 px-6 py-12">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-zinc-600 leading-relaxed">
                            {business.theme_settings.store_description}
                        </p>
                    </div>
                </section>
            )}

            <StoreFooter business={business} />

            <CartDrawer
                items={items}
                total={total}
                itemCount={itemCount}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
                businessSlug={business.slug}
                primaryColor={business.theme_settings.primary_color}
                onCheckout={() => trackEvent('InitiateCheckout', { value: total, currency: 'GHS' })}
            />
        </div>
    );
}
