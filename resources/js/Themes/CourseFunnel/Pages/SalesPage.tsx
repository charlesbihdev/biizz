import { Link, router } from '@inertiajs/react';
import { BookOpen, CreditCard, MessageCircle, ShoppingBag } from 'lucide-react';
import FunnelThemeShell, { type CartActions } from '../ThemeShell';
import FunnelNav from '../Components/FunnelNav';
import FunnelFooter from '../Components/FunnelFooter';
import ProductImageGallery from '../Components/ProductImageGallery';
import TiptapRenderer from '@/components/TiptapRenderer';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';
import { checkout, product as productRoute } from '@/routes/storefront';
import type { Business, Page, PaginatedData, Product } from '@/types/business';


interface Props {
    business:          Business;
    pages:             Page[];
    featured_product?: Product | null;
    products?:         PaginatedData<Product>;
}


function toEmbedUrl(src: string): string {
    // youtube.com/watch?v=ID or youtu.be/ID
    const ytMatch = src.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
        return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    // vimeo.com/ID (not already a player URL)
    const vimeoMatch = src.match(/(?<!player\.)vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return src;
}

function VideoSection({ src }: { src: string }) {
    const isEmbed = /youtube|youtu\.be|vimeo|\/embed\//.test(src);
    const embedSrc = isEmbed ? toEmbedUrl(src) : src;

    return (
        <section className="bg-white px-6 py-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="overflow-hidden rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
                    <div className="aspect-video">
                        {isEmbed ? (
                            <iframe
                                src={embedSrc}
                                className="h-full w-full"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                loading="lazy"
                            />
                        ) : (
                            <video
                                src={src}
                                controls
                                className="h-full w-full object-cover"
                                preload="metadata"
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ProductCard({
    product,
    business,
    accent,
}: {
    product:  Product;
    business: Business;
    accent:   string;
}) {
    const image = product.images[0]?.url;
    const price = parseFloat(product.price);

    return (
        <Link
            href={productRoute({ business: business.slug, product: product.slug }).url}
            className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
            <div className="aspect-3/4 overflow-hidden bg-zinc-50">
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="h-12 w-12 text-zinc-200" />
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-1.5 p-4">
                <p className="text-sm font-semibold leading-snug text-zinc-900 line-clamp-2">
                    {product.name}
                </p>
                <p className="text-sm font-bold" style={{ color: accent }}>
                    GHS {price.toFixed(2)}
                </p>
            </div>
        </Link>
    );
}

function CatalogMode({
    business,
    products,
    pages,
    cartActions,
}: {
    business:    Business;
    products:    PaginatedData<Product>;
    pages:       Page[];
    cartActions: CartActions;
}) {
    const { isAuthenticated, loginMode, customer } = useCustomerAuth();
    const accent = (business.theme_settings.accent_color as string | undefined) || '#6366f1';

    return (
        <div className="min-h-screen bg-white">
            <FunnelNav
                business={business}
                pages={pages}
                accent={accent}
                loginMode={loginMode}
                isAuthenticated={isAuthenticated}
                customer={customer}
                onAuthClick={cartActions.openAuth}
            />

            <div className="pt-16">
                <section className="border-b border-zinc-100 bg-white px-6 py-10 lg:px-8 lg:py-14">
                    <div className="mx-auto max-w-6xl">
                        <p
                            className="mb-2 text-xs font-bold uppercase tracking-widest"
                            style={{ color: accent }}
                        >
                            {business.name}
                        </p>
                        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 lg:text-4xl">
                            {business.name}
                        </h1>
                        {business.tagline && (
                            <p className="mt-2 max-w-xl text-base text-zinc-500">{business.tagline}</p>
                        )}
                    </div>
                </section>

                <section className="bg-zinc-50 px-6 py-10 lg:px-8 lg:py-14">
                    <div className="mx-auto max-w-6xl">
                        {products.data.length === 0 ? (
                            <p className="py-16 text-center text-sm text-zinc-400">
                                No products available yet.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                                {products.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        business={business}
                                        accent={accent}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <FunnelFooter business={business} pages={pages} />
        </div>
    );
}

function SingleProductFunnel({
    business,
    product,
    pages,
    cartActions,
}: {
    business:    Business;
    product:     Product | null;
    pages:       Page[];
    cartActions: CartActions;
}) {
    const { isAuthenticated, loginMode, customer } = useCustomerAuth();
    const { theme_settings: s } = business;
    const accent       = (s.accent_color as string | undefined) || '#6366f1';
    const ctaLabel = (s.cta_text as string | undefined) || 'Get Instant Access';
    const promoVideo   = product?.promo_video || null;
    const salesContent = product?.description || null;
    const enableWa     = s.enable_whatsapp_cta !== false;
    const enablePay    = s.enable_payment_cta === true;
    const b            = { business: business.slug };

    const price        = product ? parseFloat(product.price) : null;
    const priceDisplay = price !== null ? `GHS ${price.toFixed(2)}` : null;

    const hasPayment   = business.default_payment_provider !== null;
    const showPayButton = enablePay && hasPayment && !!product;
    const showWaButton  = enableWa;

    const goToCheckout = () => {
        if (product) {
            cartActions.addToCart({
                id:       product.id,
                name:     product.name,
                price:    parseFloat(product.price),
                quantity: 1,
                image:    product.images[0]?.url,
            });
            cartActions.trackEvent('AddToCart', {
                content_name: product.name,
                value:        parseFloat(product.price),
                currency:     'GHS',
            });
        }
        router.visit(checkout(b).url);
    };

    return (
        <div className="min-h-screen bg-white">
            <FunnelNav
                business={business}
                pages={pages}
                accent={accent}
                loginMode={loginMode}
                isAuthenticated={isAuthenticated}
                customer={customer}
                onAuthClick={cartActions.openAuth}
                catalogMode={false}
            />

            {/* Main content — title, description left + pricing card right */}
            <section className="px-6 pt-20 pb-16 lg:px-8 lg:pt-24">
                <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">

                    {/* Left: title + video + description */}
                    <div className="min-w-0 flex-1">
                        <span
                            className="mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
                            style={{ backgroundColor: accent + '15', color: accent }}
                        >
                            Digital Product
                        </span>
                        <h1 className="mb-6 text-3xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
                            {product?.name}
                        </h1>

                        {promoVideo && (
                            <div className="mb-8">
                                <VideoSection src={promoVideo} />
                            </div>
                        )}

                        {salesContent && (
                            <TiptapRenderer content={salesContent} className="prose-lg" />
                        )}
                    </div>

                    {/* Right: sticky pricing card */}
                    {product && (
                        <div className="w-full shrink-0 lg:sticky lg:top-24 lg:w-80">
                            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
                                {/* Image above price */}
                                {product.images.length > 0 && (
                                    <div className="overflow-hidden rounded-t-2xl">
                                        <ProductImageGallery
                                            images={product.images}
                                            alt={product.name}
                                            accent={accent}
                                            fill
                                        />
                                    </div>
                                )}

                                <div className="p-6">
                                {priceDisplay && (
                                    <p className="mb-1 text-3xl font-extrabold" style={{ color: accent }}>
                                        {priceDisplay}
                                    </p>
                                )}
                                <p className="mb-6 text-xs text-zinc-400">One-time payment. No subscription.</p>

                                <div className="flex flex-col gap-3">
                                    {showPayButton && (
                                        <button
                                            type="button"
                                            onClick={goToCheckout}
                                            className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 active:scale-95"
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
                                            className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 active:scale-95"
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
                                            className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 active:scale-95"
                                            style={{ backgroundColor: accent }}
                                        >
                                            <ShoppingBag className="h-4 w-4" />
                                            {ctaLabel}
                                        </button>
                                    )}
                                </div>

                                {showPayButton && (
                                    <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                                        <CreditCard className="h-3.5 w-3.5 shrink-0" />
                                        Multiple payment options supported
                                    </p>
                                )}
                                </div>{/* /p-6 */}
                            </div>{/* /card */}
                        </div>
                    )}
                </div>
            </section>

            {/* Copyright only — no full footer in single-product mode */}
            <div className="border-t border-zinc-100 px-6 py-6 text-center text-xs text-zinc-400">
                {new Date().getFullYear()} {business.name}. All rights reserved.
            </div>
        </div>
    );
}

function SalesPageContent({
    business,
    featured_product,
    products,
    pages,
    cartActions,
}: Props & { cartActions: CartActions }) {
    const catalogMode = business.theme_settings.catalog_mode === true;

    if (catalogMode && products) {
        return (
            <CatalogMode
                business={business}
                products={products}
                pages={pages}
                cartActions={cartActions}
            />
        );
    }

    return (
        <SingleProductFunnel
            business={business}
            product={featured_product ?? null}
            pages={pages}
            cartActions={cartActions}
        />
    );
}

export default function SalesPage({ business, featured_product, products, pages }: Props) {
    return (
        <FunnelThemeShell business={business} pages={pages}>
            {(actions) => (
                <SalesPageContent
                    business={business}
                    featured_product={featured_product}
                    products={products}
                    pages={pages}
                    cartActions={actions}
                />
            )}
        </FunnelThemeShell>
    );
}
