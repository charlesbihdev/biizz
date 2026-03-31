import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { junipayInit } from '@/routes/storefront/checkout';
import { useCartStore } from '@/stores/cartStore';

// ─── JuniPop global type declaration ────────────────────────────────────────

interface JuniPopConfig {
    key:        string;
    clientid:   string;
    email:      string;
    amount:     number;
    total_amt:  number;
    color?:     string;
    desc:       string;
    foreignID:  string;
    callbackUrl: string;
    redirectUrl: string;
    onClose?:   () => void;
}

declare global {
    interface Window {
        jQuery?: unknown;
        JuniPop?: { setup: (config: JuniPopConfig) => void };
    }
}

const JQUERY_CDN = 'https://code.jquery.com/jquery-3.7.1.min.js';
const JUNIPAY_INLINE_CDN = 'https://api.junipayments.com/js/inline.js';

function hasJquery(): boolean {
    return typeof window !== 'undefined' && typeof window.jQuery !== 'undefined';
}

/**
 * JuniPay's inline.js declares `class JuniPop` in the global script realm. That creates a
 * global binding but does not set `window.JuniPop` (unlike `var` / `function`). Our bundle
 * runs in a module, so we bridge once so `window.JuniPop` matches the docs and our types.
 */
function bridgeJuniPopToWindow(): void {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        return;
    }
    if (window.JuniPop) {
        return;
    }

    const s = document.createElement('script');
    s.textContent = 'try { window.JuniPop = JuniPop; } catch (e) {}';
    document.head.appendChild(s);
    s.remove();
}

function hasJuniPopReady(): boolean {
    return typeof window !== 'undefined' && typeof window.JuniPop !== 'undefined';
}

function loadExternalScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof document === 'undefined') {
            reject(new Error(`Script loading is unavailable outside the browser: ${src}`));
            return;
        }

        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve();
                return;
            }

            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.addEventListener('load', () => {
            script.dataset.loaded = 'true';
            resolve();
        }, { once: true });
        script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
        document.head.appendChild(script);
    });
}

// ─── Shape of junipay_init prop returned by the controller ──────────────────

interface JunipayInitData {
    token:        string;
    client_id:    string;
    reference:    string;
    amount:       number;
    description:  string;
    email:        string;
    callback_url: string;
    redirect_url: string;
}

// ─── Hook public API ─────────────────────────────────────────────────────────

interface CheckoutData {
    customer_name:  string;
    customer_email: string;
    customer_phone: string;
    delivery_address: string;
    delivery_city:    string;
    delivery_region:  string;
    delivery_country: string;
    save_address:     boolean;
}

interface UseJunipayCheckoutReturn {
    submitOrder:  (data: CheckoutData) => void;
    isSubmitting: boolean;
    errors:       Record<string, string>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Shared Junipay Payment Form hook.
 * - jQuery and JuniPop inline.js are loaded on-demand in this hook.
 * - submitOrder() posts to the backend via Inertia router, receives a
 *   short-lived token as a partial prop, then opens the JuniPop popup.
 *   The secret never touches the frontend.
 * - Usable by any theme — import and call, no extra config.
 */
export function useJunipayCheckout(businessSlug: string): UseJunipayCheckoutReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [scriptReady, setScriptReady]   = useState(false);
    const [errors, setErrors]            = useState<Record<string, string>>({});
    const items                          = useCartStore((s) => s.items);

    useEffect(() => {
        let cancelled = false;

        const ensureJunipayScripts = async () => {
            try {
                if (!hasJquery()) {
                    await loadExternalScript(JQUERY_CDN);
                }

                await loadExternalScript(JUNIPAY_INLINE_CDN);
                bridgeJuniPopToWindow();

                if (!cancelled && hasJuniPopReady()) {
                    setScriptReady(true);
                }
            } catch {
                if (!cancelled) {
                    setScriptReady(false);
                    setErrors({
                        _script: 'Unable to load payment module. Please refresh the page and try again.',
                    });
                }
            }
        };

        void ensureJunipayScripts();

        return () => {
            cancelled = true;
        };
    }, []);

    const submitOrder = (data: CheckoutData) => {
        bridgeJuniPopToWindow();
        if (!scriptReady || !window.JuniPop) {
            setErrors({ _script: 'Payment module is still loading. Please wait a moment and try again.' });
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        router.post(
            junipayInit(businessSlug),
            { ...data, items: items as unknown as Array<Record<string, string | number | boolean | null>> },
            {
                preserveUrl:    true,
                preserveScroll: true,
                only:           ['junipay_init'],
                onSuccess: (page) => {
                    const init = (page.props as unknown as { junipay_init: JunipayInitData }).junipay_init;

                    if (!init?.token) {
                        setErrors({ _script: 'Payment could not be started. Please try again.' });
                        setIsSubmitting(false);
                        return;
                    }

                    if (!window.JuniPop) {
                        setErrors({ _script: 'Payment popup could not be opened. Please refresh and try again.' });
                        setIsSubmitting(false);
                        return;
                    }

                    window.JuniPop.setup({
                        key:        init.token,
                        clientid:   init.client_id,
                        email:      init.email,
                        amount:     init.amount,
                        total_amt:  init.amount,
                        color:      'white',
                        desc:       init.description,
                        foreignID:  init.reference,
                        callbackUrl: init.callback_url,
                        redirectUrl: init.redirect_url,
                        onClose: () => setIsSubmitting(false),
                    });
                },
                onError: (errors) => {
                    setErrors(errors as Record<string, string>);
                    setIsSubmitting(false);
                },
            },
        );
    };

    return { submitOrder, isSubmitting, errors };
}
