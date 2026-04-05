import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronLeft, CreditCard, Lock, MessageCircle, ShoppingBag } from 'lucide-react';
import FunnelThemeShell, { type CartActions } from '../ThemeShell';
import { useCartStore } from '@/stores/cartStore';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';
import { useCheckout } from '@/Themes/Shared/Hooks/useCheckout';
import { useJunipayCheckout } from '@/Themes/Shared/Hooks/useJunipayCheckout';
import { show } from '@/routes/storefront';
import type { Business, Page } from '@/types/business';

interface Props {
    business:    Business;
    pages:       Page[];
    hasPaystack: boolean;
    hasJunipay:  boolean;
}

function resolveWhatsApp(s: Business['theme_settings'], business: Business): string | null {
    const num = (s.whatsapp_number as string | undefined)
        || business.social_links?.whatsapp
        || business.phone
        || null;
    return num ? num.replace(/\D/g, '') : null;
}

function field(label: string, required: boolean, node: React.ReactNode) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">
                {label}
                {required && <span className="ml-0.5 text-red-400">*</span>}
            </label>
            {node}
        </div>
    );
}

function inputCls(hasError: boolean) {
    return `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-offset-0 ${
        hasError
            ? 'border-red-300 focus:ring-red-200'
            : 'border-zinc-200 focus:border-zinc-400 focus:ring-zinc-100'
    }`;
}

function CheckoutContent({
    business,
    hasPaystack,
    hasJunipay,
    openAuth,
}: {
    business:    Business;
    hasPaystack: boolean;
    hasJunipay:  boolean;
    openAuth:    CartActions['openAuth'];
}) {
    const { items, total, itemCount } = useCartStore();
    const { requiresLoginForCheckout, customer } = useCustomerAuth();
    const { flash } = usePage<{ flash?: { error?: string } }>().props;

    const { theme_settings: s } = business;
    const accent = (s.accent_color as string | undefined) || '#6366f1';
    const ctaLabel = (s.cta_text as string | undefined) || 'Pay Now';
    const enableWa   = s.enable_whatsapp_cta !== false;
    const enablePay  = s.enable_payment_cta === true;
    const hasPayment = hasPaystack || hasJunipay;
    const showPayButton = enablePay && hasPayment;
    const waNumber      = resolveWhatsApp(s, business);
    const showWaButton  = enableWa && !!waNumber;

    const mode = business.default_payment_provider === 'junipay' ? 'junipay' : 'paystack';
    const paystackHook = useCheckout(business.slug);
    const junipayHook  = useJunipayCheckout(business.slug);
    const { submitOrder, isSubmitting, errors } = mode === 'junipay' ? junipayHook : paystackHook;

    const [name,  setName]  = useState(customer?.name  ?? '');
    const [email, setEmail] = useState(customer?.email ?? '');
    const [phone, setPhone] = useState(customer?.phone ?? '');

    useEffect(() => {
        if (requiresLoginForCheckout) {
            openAuth();
        }
    }, [requiresLoginForCheckout]);

    const b = { business: business.slug };

    const buildWaUrl = () => {
        const lines = items.map(
            (i) => `  - ${i.name} x${i.quantity}  GHS ${(i.price * i.quantity).toFixed(2)}`,
        );
        const msg = [
            `Hi! I would like to place an order.`,
            '',
            `Order:`,
            ...lines,
            `  Total: GHS ${total.toFixed(2)}`,
            '',
            `My details:`,
            `  Name: ${name}`,
            ...(phone ? [`  Phone: ${phone}`] : []),
            ...(email ? [`  Email: ${email}`] : []),
        ].join('\n');

        return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    };

    const handlePay = (e: React.FormEvent) => {
        e.preventDefault();
        submitOrder({
            customer_name:    name,
            customer_email:   email,
            customer_phone:   phone,
            delivery_address: '',
            delivery_city:    '',
            delivery_region:  '',
            delivery_country: 'Ghana',
            save_address:     false,
        });
    };

    const handleWhatsApp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) { return; }
        window.open(buildWaUrl(), '_blank', 'noopener');
    };

    if (requiresLoginForCheckout) {
        return (
            <main className="flex min-h-screen items-center justify-center px-6">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
                        <Lock className="h-6 w-6 text-zinc-400" />
                    </div>
                    <h1 className="mb-2 text-xl font-bold text-zinc-900">Sign in to continue</h1>
                    <p className="mb-6 text-sm text-zinc-500">
                        You need an account to place an order at {business.name}.
                    </p>
                    <button
                        type="button"
                        onClick={openAuth}
                        className="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                        style={{ backgroundColor: accent }}
                    >
                        Sign in
                    </button>
                </div>
            </main>
        );
    }

    if (itemCount === 0) {
        return (
            <main className="flex min-h-screen items-center justify-center px-6">
                <div className="text-center">
                    <p className="mb-4 text-sm text-zinc-500">Nothing in your cart yet.</p>
                    <Link
                        href={show(b).url}
                        className="inline-flex items-center gap-1.5 text-sm font-medium transition hover:underline"
                        style={{ color: accent }}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to store
                    </Link>
                </div>
            </main>
        );
    }

    const firstItem = items[0];

    return (
        <main className="min-h-screen bg-white">
            {/* Top bar */}
            <div className="border-b border-zinc-100 px-6 py-4 lg:px-8">
                <div className="mx-auto max-w-lg">
                    <Link
                        href={show(b).url}
                        className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to store
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-lg px-6 py-10 lg:px-8">

                {/* Product summary */}
                <div className="mb-8 flex items-center gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                    {firstItem.image && (
                        <img
                            src={firstItem.image}
                            alt={firstItem.name}
                            className="h-16 w-12 shrink-0 rounded-lg object-cover shadow-sm"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">{firstItem.name}</p>
                        {items.length > 1 && (
                            <p className="text-xs text-zinc-400">+{items.length - 1} more item{items.length > 2 ? 's' : ''}</p>
                        )}
                    </div>
                    <p className="shrink-0 text-base font-bold" style={{ color: accent }}>
                        GHS {total.toFixed(2)}
                    </p>
                </div>

                {flash?.error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {flash.error}
                    </div>
                )}

                {/* Order form */}
                <h1 className="mb-6 text-xl font-bold text-zinc-900">Complete your order</h1>

                <form onSubmit={showPayButton ? handlePay : handleWhatsApp} className="flex flex-col gap-4">
                    {field('Full Name', true,
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Kwame Mensah"
                            className={inputCls(!!errors.customer_name)}
                        />,
                    )}
                    {errors.customer_name && (
                        <p className="-mt-2 text-xs text-red-500">{errors.customer_name}</p>
                    )}

                    {field('Email', showPayButton,
                        <input
                            type="email"
                            required={showPayButton}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="kwame@example.com"
                            className={inputCls(!!errors.customer_email)}
                        />,
                    )}
                    {errors.customer_email && (
                        <p className="-mt-2 text-xs text-red-500">{errors.customer_email}</p>
                    )}

                    {field('Phone Number', showWaButton || !showPayButton,
                        <input
                            type="tel"
                            required={showWaButton || !showPayButton}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0244 000 000"
                            className={inputCls(!!errors.customer_phone)}
                        />,
                    )}
                    {errors.customer_phone && (
                        <p className="-mt-2 text-xs text-red-500">{errors.customer_phone}</p>
                    )}

                    {(errors._form || errors._script) && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {errors._form ?? errors._script}
                        </div>
                    )}

                    <div className="mt-2 flex flex-col gap-3">
                        {showPayButton && (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                                style={{ backgroundColor: accent }}
                            >
                                {isSubmitting ? (
                                    'Processing...'
                                ) : (
                                    <>
                                        <ShoppingBag className="h-4 w-4" />
                                        {ctaLabel} — GHS {total.toFixed(2)}
                                    </>
                                )}
                            </button>
                        )}

                        {showWaButton && (
                            <button
                                type="button"
                                onClick={handleWhatsApp}
                                disabled={!name || !phone}
                                className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
                                style={{ backgroundColor: '#25D366' }}
                            >
                                <MessageCircle className="h-4 w-4" />
                                Order via WhatsApp
                            </button>
                        )}
                    </div>

                    {showPayButton && (
                        <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                            <CreditCard className="h-3.5 w-3.5 shrink-0" />
                            Multiple payment options supported
                        </p>
                    )}
                </form>
            </div>
        </main>
    );
}

export default function Checkout({ business, pages, hasPaystack, hasJunipay }: Props) {
    return (
        <FunnelThemeShell business={business} pages={pages}>
            {(actions) => (
                <CheckoutContent
                    business={business}
                    hasPaystack={hasPaystack}
                    hasJunipay={hasJunipay}
                    openAuth={actions.openAuth}
                />
            )}
        </FunnelThemeShell>
    );
}
