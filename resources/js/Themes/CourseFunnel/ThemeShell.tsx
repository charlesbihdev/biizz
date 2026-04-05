import { useEffect, useState, type ReactNode } from 'react';
import type { Business, CartItem, Page } from '@/types/business';
import { useCartStore } from '@/stores/cartStore';
import { useMetaPixel, type PixelEvent } from '@/Themes/Shared/Hooks/useMetaPixel';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';
import ToastProvider from '@/components/toast-provider';
import AuthModal from '../Classic/Components/Auth/AuthModal';

export type CartActions = {
    addToCart:  (item: CartItem) => void;
    trackEvent: (event: PixelEvent, data?: Record<string, unknown>) => void;
    openAuth:   () => void;
};

interface Props {
    business: Business;
    pages:    Page[];
    children: ReactNode | ((actions: CartActions) => ReactNode);
}

function BiizzBadge({ show }: { show: boolean }) {
    if (!show) return null;
    return (
        <a
            href="https://biizz.app"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-5 left-5 z-50 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-zinc-500 shadow-lg ring-1 ring-black/5 transition hover:text-zinc-900 hover:shadow-xl"
        >
            Powered by
            <span className="font-bold text-zinc-900 tracking-tight">biizz</span>
        </a>
    );
}

export default function FunnelThemeShell({ business, pages, children }: Props) {
    const { addToCart }        = useCartStore();
    const { trackEvent }       = useMetaPixel(business.meta_pixel_id ?? '');
    const { isBlocked }        = useCustomerAuth();
    const [authOpen, setAuthOpen] = useState(false);

    useEffect(() => {
        if (isBlocked) {
            setAuthOpen(true);
        }
    }, [isBlocked]);

    const cartActions: CartActions = {
        addToCart,
        trackEvent,
        openAuth: () => setAuthOpen(true),
    };

    return (
        <ToastProvider>
            <div className="min-h-screen font-sans antialiased bg-white">
                {typeof children === 'function' ? children(cartActions) : children}

                <AuthModal
                    isOpen={authOpen}
                    onClose={() => setAuthOpen(false)}
                    business={business}
                    required={isBlocked}
                />
            </div>

            <BiizzBadge show={business.show_branding !== false} />
        </ToastProvider>
    );
}
