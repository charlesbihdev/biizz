import { useEffect, useState, type ReactNode } from 'react';
import type { Business, CartItem, Page } from '@/types/business';
import { useCartStore } from '@/stores/cartStore';
import { useMetaPixel, type PixelEvent } from '@/Themes/Shared/Hooks/useMetaPixel';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';
import { useSemanticTokens } from '@/Themes/Shared/Hooks/useSemanticTokens';
import type { SemanticTokens } from '@/Themes/Shared/Tokens';
import AuthModal from './Components/Auth/AuthModal';
import CartDrawer from './Components/CartDrawer';
import ToastProvider from '@/components/toast-provider';
import StorefrontNav from './Components/Navigation/StorefrontNav';
import StoreFooter from './Components/StoreFooter';

export type CartActions = {
    addToCart:   (item: CartItem) => void;
    trackEvent:  (event: PixelEvent, data?: Record<string, unknown>) => void;
    openAuth:    () => void;
    tokens:      SemanticTokens;
};

interface Props {
    business: Business;
    pages:    Page[];
    children: ReactNode | ((actions: CartActions) => ReactNode);
}

export default function ClassicThemeShell({ business, pages, children }: Props) {
    const { items, addToCart, removeFromCart, updateQuantity, total, itemCount } = useCartStore();
    const { trackEvent } = useMetaPixel(business.meta_pixel_id ?? '');
    const { isBlocked, isAuthenticated, loginMode } = useCustomerAuth();
    const tokens = useSemanticTokens(business);

    const [cartOpen, setCartOpen]   = useState(false);
    const [authOpen, setAuthOpen]   = useState(false);

    useEffect(() => {
        if (isBlocked) {
            setAuthOpen(true);
        }
    }, [isBlocked]);

    const cartActions: CartActions = {
        addToCart,
        trackEvent,
        openAuth: () => setAuthOpen(true),
        tokens,
    };

    return (
        <ToastProvider>
            <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: tokens.surface }}>
                <StorefrontNav
                    business={business}
                    pages={pages}
                    itemCount={itemCount}
                    onCartOpen={() => setCartOpen(true)}
                    onAuthOpen={() => setAuthOpen(true)}
                    isAuthenticated={isAuthenticated}
                    loginMode={loginMode}
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
                    tokens={tokens}
                    onCheckout={() => trackEvent('InitiateCheckout', { value: total, currency: 'GHS' })}
                />

                <AuthModal
                    isOpen={authOpen}
                    onClose={() => setAuthOpen(false)}
                    business={business}
                    required={isBlocked}
                />
            </div>
        </ToastProvider>
    );
}
