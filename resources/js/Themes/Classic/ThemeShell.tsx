import { useState, type ReactNode } from 'react';
import type { Business, CartItem, Page } from '@/types/business';
import { useCartStore } from '@/stores/cartStore';
import { useMetaPixel, type PixelEvent } from '@/Themes/Shared/Hooks/useMetaPixel';
import CartDrawer from './Components/CartDrawer';
import ToastProvider from '@/components/toast-provider';
import StorefrontNav from './Components/StorefrontNav';
import StoreFooter from './Components/StoreFooter';

export type CartActions = {
    addToCart:  (item: CartItem) => void;
    trackEvent: (event: PixelEvent, data?: Record<string, unknown>) => void;
};

interface Props {
    business: Business;
    pages:    Page[];
    children: ReactNode | ((actions: CartActions) => ReactNode);
}

export default function ClassicThemeShell({ business, pages, children }: Props) {
    const { items, addToCart, removeFromCart, updateQuantity, total, itemCount } = useCartStore();
    const { trackEvent } = useMetaPixel(business.meta_pixel_id ?? '');
    const [cartOpen, setCartOpen] = useState(false);

    const { theme_settings: s } = business;
    const primary = s.primary_color ?? '#1a1a1a';
    const accent  = s.accent_color  ?? primary;
    const bg      = s.bg_color      ?? '#ffffff';
    const cartActions: CartActions = { addToCart, trackEvent };

    return (
        <ToastProvider>
            <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: bg }}>
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
                accentColor={accent}
                onCheckout={() => trackEvent('InitiateCheckout', { value: total, currency: 'GHS' })}
            />
            </div>
        </ToastProvider>
    );
}
