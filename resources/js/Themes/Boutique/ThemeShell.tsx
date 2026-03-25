import { useState, type ReactNode } from 'react';
import type { Business, CartItem, Page } from '@/types/business';
import { useCartStore as useCart } from '@/stores/cartStore';
import { useMetaPixel } from '@/Themes/Shared/Hooks/useMetaPixel';
import CartDrawer from '@/Themes/Shared/Components/CartDrawer';
import StorefrontNav from './Components/StorefrontNav';
import StoreFooter from './Components/StoreFooter';

export type CartActions = {
    addToCart:  (item: CartItem) => void;
    trackEvent: (event: string, data?: Record<string, unknown>) => void;
};

interface Props {
    business: Business;
    pages:    Page[];
    children: ReactNode | ((actions: CartActions) => ReactNode);
}

export default function BoutiqueThemeShell({ business, pages, children }: Props) {
    const { items, addToCart, removeFromCart, updateQuantity, total, itemCount } = useCart();
    const { trackEvent } = useMetaPixel(business.meta_pixel_id ?? '');
    const [cartOpen, setCartOpen] = useState(false);

    const { theme_settings: s } = business;
    const cartActions: CartActions = { addToCart, trackEvent };

    return (
        <div className="min-h-screen bg-white font-sans antialiased">
            <StorefrontNav
                business={business}
                pages={pages}
                itemCount={itemCount}
                onCartOpen={() => setCartOpen(true)}
            />

            {typeof children === 'function' ? children(cartActions) : children}

            <StoreFooter business={business} pages={pages} />

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
