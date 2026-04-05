import { router } from '@inertiajs/react';
import { BookOpen, CreditCard, MessageCircle, ShoppingBag } from 'lucide-react';
import FunnelThemeShell, { type CartActions } from '../ThemeShell';
import FunnelNav from '../Components/FunnelNav';
import FunnelFooter from '../Components/FunnelFooter';
import ProductImageGallery from '../Components/ProductImageGallery';
import TiptapRenderer from '@/components/TiptapRenderer';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';
import { checkout } from '@/routes/storefront';
import type { Business, Page, Product } from '@/types/business';

interface Props {
    business: Business;
    product:  Product;
    related:  Product[];
    pages:    Page[];
}

function resolveWhatsApp(s: Business['theme_settings'], business: Business): string | null {
    const num = (s.whatsapp_number as string | undefined)
        || business.social_links?.whatsapp
        || business.phone
        || null;
    return num ? num.replace(/\D/g, '') : null;
}

function ProductFunnelContent({
    business,
    product,
    pages,
    cartActions,
}: Props & { cartActions: CartActions }) {
    const { isAuthenticated, loginMode, customer } = useCustomerAuth();
    const { theme_settings: s } = business;
    const accent      = (s.accent_color as string | undefined) || '#6366f1';
    const ctaLabel    = (s.cta_text as string | undefined) || 'Buy Now';
    const catalogMode = s.catalog_mode === true;
    const enableWa    = s.enable_whatsapp_cta !== false;
    const enablePay   = s.enable_payment_cta === true;
    const b           = { business: business.slug };

    const price        = parseFloat(product.price);
    const priceDisplay = `GHS ${price.toFixed(2)}`;

    const waNumber      = resolveWhatsApp(s, business);
    const hasPayment    = business.default_payment_provider !== null;
    const showPayButton = enablePay && hasPayment;
    const showWaButton  = enableWa;

    const goToCheckout = () => {
        cartActions.addToCart({
            id:       product.id,
            name:     product.name,
            price,
            quantity: 1,
            image:    product.images[0]?.url,
        });
        cartActions.trackEvent('AddToCart', {
            content_name: product.name,
            value:        price,
            currency:     'GHS',
        });
        router.visit(checkout(b).url);
    };

    const BuyButtons = () => (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {showPayButton && (
                <button
                    type="button"
                    onClick={goToCheckout}
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 active:scale-95"
                    style={{ backgroundColor: accent }}
                >
                    <ShoppingBag className="h-4 w-4" />
                    {ctaLabel}
                </button>
            )}

            {showWaButton && (
                <button
                    type="button"
                    onClick={goToCheckout}
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 active:scale-95"
                    style={{ backgroundColor: '#25D366' }}
                >
                    <MessageCircle className="h-4 w-4" />
                    Order via WhatsApp
                </button>
            )}

            {!showPayButton && !showWaButton && (
                <button
                    type="button"
                    onClick={goToCheckout}
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 active:scale-95"
                    style={{ backgroundColor: accent }}
                >
                    <ShoppingBag className="h-4 w-4" />
                    {ctaLabel}
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            <FunnelNav
                business={business}
                pages={pages}
                accent={accent}
                loginMode={loginMode}
                isAuthenticated={isAuthenticated}
                customer={customer}
                catalogMode={catalogMode}
                onAuthClick={cartActions.openAuth}
            />

            {/* Product hero */}
            <section className="relative overflow-hidden bg-white px-6 pt-20 pb-14 lg:px-8 lg:pt-28 lg:pb-20">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `radial-gradient(circle, ${accent} 1px, transparent 1px)`,
                        backgroundSize:  '28px 28px',
                    }}
                />
                <div
                    className="pointer-events-none absolute -left-32 -top-32 h-100 w-100 rounded-full opacity-10 blur-[80px]"
                    style={{ background: accent }}
                />

                <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-14">
                    {/* Cover image / gallery */}
                    <div className="flex shrink-0 justify-center lg:order-last">
                        {product.images.length > 0 ? (
                            <ProductImageGallery
                                images={product.images}
                                alt={product.name}
                                accent={accent}
                            />
                        ) : (
                            <div
                                className="flex h-75 w-55 items-center justify-center rounded-2xl"
                                style={{ backgroundColor: accent + '10' }}
                            >
                                <BookOpen className="h-14 w-14" style={{ color: accent + '50' }} />
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 text-center lg:text-left">
                        <span
                            className="mb-4 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
                            style={{ backgroundColor: accent + '15', color: accent }}
                        >
                            Digital Product
                        </span>

                        <h1 className="mb-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 lg:text-4xl">
                            {product.name}
                        </h1>

                        <p className="mb-6 text-2xl font-extrabold" style={{ color: accent }}>
                            {priceDisplay}
                            <span className="ml-2 text-sm font-normal text-zinc-400">one-time payment</span>
                        </p>

                        <div className="flex justify-center lg:justify-start">
                            <BuyButtons />
                        </div>

                        {showPayButton && (
                            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-400 lg:justify-start">
                                <CreditCard className="h-3.5 w-3.5 shrink-0" />
                                Multiple payment options supported
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Description */}
            {product.description && (
                <section className="bg-[#fafaf9] px-6 py-14 lg:px-8">
                    <div className="mx-auto max-w-3xl">
                        <TiptapRenderer content={product.description} className="prose-lg" />
                    </div>
                </section>
            )}

            {/* Bottom CTA */}
            {(showPayButton || showWaButton) && (
                <section className="border-t border-zinc-100 bg-white px-6 py-14 lg:px-8">
                    <div className="mx-auto max-w-md text-center">
                        <h2 className="mb-2 text-xl font-extrabold tracking-tight text-zinc-900">
                            Get your copy today
                        </h2>
                        <p className="mb-6 text-xl font-extrabold" style={{ color: accent }}>
                            {priceDisplay}
                        </p>
                        <div className="flex justify-center">
                            <BuyButtons />
                        </div>
                    </div>
                </section>
            )}

            {catalogMode ? (
                <FunnelFooter business={business} pages={pages} />
            ) : (
                <div className="border-t border-zinc-100 px-6 py-6 text-center text-xs text-zinc-400">
                    {new Date().getFullYear()} {business.name}. All rights reserved.
                </div>
            )}
        </div>
    );
}

export default function ProductPage({ business, product, related, pages }: Props) {
    return (
        <FunnelThemeShell business={business} pages={pages}>
            {(cartActions) => (
                <ProductFunnelContent
                    business={business}
                    product={product}
                    related={related}
                    pages={pages}
                    cartActions={cartActions}
                />
            )}
        </FunnelThemeShell>
    );
}
