import { useCallback } from 'react';

/**
 * Pixel event types supported by the biizz.app pipeline.
 * Maps directly to the Meta Pixel standard events.
 */
export type PixelEvent =
    | 'ViewContent'
    | 'AddToCart'
    | 'InitiateCheckout'
    | 'Purchase'
    | 'Search'
    | 'Lead';

interface UseMetaPixelReturn {
    trackEvent: (event: PixelEvent, data?: Record<string, unknown>) => void;
}

/**
 * Theme-agnostic Meta Pixel hook.
 *
 * Lives in Shared/Hooks so every theme (Classic, Boutique, future themes)
 * gets identical pixel tracking without duplicating any logic.
 *
 * Usage:
 *   const { trackEvent } = useMetaPixel(business.meta_pixel_id ?? '');
 *   trackEvent('AddToCart', { content_name: product.name, value: 29.99 });
 */
export function useMetaPixel(pixelId: string): UseMetaPixelReturn {
    const trackEvent = useCallback(
        (event: PixelEvent, data?: Record<string, unknown>) => {
            if (!pixelId) return;
            if (typeof window === 'undefined') return;
            if (typeof (window as Window & { fbq?: Function }).fbq !== 'function') return;

            (window as unknown as Window & { fbq: Function }).fbq('track', event, data);
        },
        [pixelId],
    );

    return { trackEvent };
}
