import { useState } from 'react';
import type { Business, PaginatedData, Product } from '@/types/business';
import { useCart } from '@/Themes/Shared/Hooks/useCart';
import { useMetaPixel } from '@/Themes/Shared/Hooks/useMetaPixel';
import CartDrawer from '@/Themes/Shared/Components/CartDrawer';
import HeroBanner from './Components/HeroBanner';
import LookbookGrid from './Components/LookbookGrid';
import StorefrontNav from './Components/StorefrontNav';
import StoreFooter from './Components/StoreFooter';
import TestimonialRow from './Components/TestimonialRow';

interface Props {
    business: Business;
    products: PaginatedData<Product>;
}

export default function BoutiqueLayout({ business, products }: Props) {
    const { items, addToCart, removeFromCart, updateQuantity, total, itemCount } = useCart();
    const { trackEvent } = useMetaPixel(business.meta_pixel_id ?? '');
    const [cartOpen, setCartOpen] = useState(false);

    const handleAddToCart = (item: Parameters<typeof addToCart>[0]) => {
        addToCart(item);
        trackEvent('AddToCart', { content_name: item.name, value: item.price, currency: 'GHS' });
    };

    const { theme_settings: s } = business;

    return (
        <div className="min-h-screen bg-white font-sans antialiased">
            <StorefrontNav
                business={business}
                itemCount={itemCount}
                onCartOpen={() => setCartOpen(true)}
            />

            <HeroBanner business={business} />

            <section id="collection" className="px-4 py-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <LookbookGrid
                        products={products.data}
                        onAddToCart={handleAddToCart}
                        settings={s}
                    />
                </div>
            </section>

            {s.show_testimonials && <TestimonialRow />}

            <StoreFooter business={business} />

            <CartDrawer
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                items={items}
                total={total}
                itemCount={itemCount}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
                businessSlug={business.slug}
                accentColor={s.accent_color}
                onCheckout={() => trackEvent('InitiateCheckout', { value: total, currency: 'GHS' })}
            />
        </div>
    );
}
