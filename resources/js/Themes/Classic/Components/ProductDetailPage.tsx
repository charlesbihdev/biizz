import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronLeft, ShoppingCart, X, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCartStore } from '@/stores/cartStore';
import type { CartItem, Product } from '@/types/business';
import ProductCard from './ProductCard';

interface Props {
    businessSlug:  string;
    product:       Product;
    related:       Product[];
    accentColor?:  string;
    primaryColor?: string;
    isDigital?:    boolean;
    onAddToCart:   (item: CartItem) => void;
}

export default function ClassicProductDetailPage({ businessSlug, product, related, accentColor, primaryColor, isDigital, onAddToCart }: Props) {
    const [activeImage,  setActiveImage]  = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const primary    = primaryColor ?? '#18181b';
    const accent     = accentColor  ?? primary;
    const price      = parseFloat(product.price);
    const outOfStock = !isDigital && product.stock === 0;
    const lowStock   = !isDigital && !outOfStock && product.stock <= 5;

    const images = product.images;
    const image  = images[activeImage]?.url ?? null;

    const cartItems = useCartStore((state) => state.items);
    const inCart    = cartItems.some((i) => i.id === product.id);

    const cartItem: CartItem = { id: product.id, name: product.name, price, quantity: 1, image: images[0]?.url };

    const handleAddToCart = () => {
        if (outOfStock) { return; }
        onAddToCart(cartItem);
    };

    const handleCheckout = () => {
        router.visit(`/s/${businessSlug}/checkout`);
    };

    const handleBuyNow = () => {
        if (outOfStock) { return; }
        onAddToCart(cartItem);
        router.visit(`/s/${businessSlug}/checkout`);
    };

    const textMuted = primary + 'b3'; // 70%

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm" style={{ color: textMuted }}>
                <Link
                    href={`/s/${businessSlug}`}
                    className="flex items-center gap-1 transition"
                    style={{ color: textMuted }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = primary; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = textMuted; }}
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back to shop
                </Link>
                {product.category && (
                    <>
                        <span>/</span>
                        <Link
                            href={`/s/${businessSlug}?category=${product.category.slug}`}
                            className="transition"
                            style={{ color: textMuted }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = primary; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = textMuted; }}
                        >
                            {product.category.name}
                        </Link>
                    </>
                )}
                <span>/</span>
                <span style={{ color: primary }}>{product.name}</span>
            </nav>

            {/* Product layout */}
            <div className="grid gap-10 lg:grid-cols-5">
                {/* Image gallery — 3/5 width */}
                <div className="lg:col-span-3">
                    <div
                        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50"
                        onClick={() => image && setLightboxOpen(true)}
                    >
                        {image ? (
                            <>
                                <img src={image} alt={product.name} className="h-full w-full object-contain p-4" />
                                <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white opacity-0 transition group-hover:opacity-100">
                                    <ZoomIn className="h-4 w-4" />
                                </div>
                            </>
                        ) : (
                            <div className="flex h-full items-center justify-center text-6xl opacity-20">📦</div>
                        )}
                    </div>

                    {/* Thumbnail strip */}
                    {images.length > 1 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                            {images.map((img, i) => (
                                <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => setActiveImage(i)}
                                    className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition"
                                    style={i === activeImage ? { borderColor: primary } : { borderColor: 'transparent' }}
                                >
                                    <img src={img.url} alt={img.alt ?? product.name} className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product info — 2/5 width */}
                <div className="flex flex-col gap-5 lg:col-span-2">
                    {product.category && (
                        <Link
                            href={`/s/${businessSlug}?category=${product.category.slug}`}
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: accent }}
                        >
                            {product.category.name}
                        </Link>
                    )}

                    <h1 className="text-2xl font-bold leading-snug sm:text-3xl" style={{ color: primary }}>{product.name}</h1>

                    <p className="text-2xl font-bold" style={{ color: accent }}>
                        GHS {price.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>

                    {/* Stock status */}
                    {!isDigital && (
                        <p className={`text-sm font-medium ${outOfStock ? 'text-red-500' : lowStock ? 'text-amber-600' : 'text-green-600'}`}>
                            {outOfStock
                                ? 'Out of stock'
                                : lowStock
                                    ? `Only ${product.stock} left in stock`
                                    : `In stock (${product.stock} available)`}
                        </p>
                    )}

                    {/* Description */}
                    {product.description && (
                        <div
                            className="prose prose-sm max-w-none"
                            style={{ color: primary + 'b3' }}
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    )}

                    {/* CTA buttons */}
                    <div className="mt-auto flex flex-col gap-3 pt-2">
                        {/* Primary: Add to Cart → Checkout */}
                        <button
                            type="button"
                            onClick={inCart ? handleCheckout : handleAddToCart}
                            disabled={outOfStock}
                            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                            style={{ backgroundColor: accent }}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {outOfStock ? 'Out of stock' : inCart ? 'Checkout' : 'Add to Cart'}
                        </button>

                        {/* Secondary: Buy Now */}
                        {!outOfStock && (
                            <button
                                type="button"
                                onClick={handleBuyNow}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 py-3.5 text-sm font-bold transition hover:opacity-80"
                                style={{ borderColor: accent, color: accent, backgroundColor: 'transparent' }}
                            >
                                Buy Now
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Related products */}
            {related.length > 0 && (
                <section className="mt-16">
                    <h2 className="mb-6 text-lg font-bold" style={{ color: primary }}>You might also like</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                        {related.map((rel) => (
                            <ProductCard
                                key={rel.id}
                                product={rel}
                                onAddToCart={onAddToCart}
                                accentColor={accentColor}
                                primaryColor={primaryColor}
                                isDigital={isDigital}
                                businessSlug={businessSlug}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Image lightbox */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="flex max-h-[95vh] max-w-4xl items-center justify-center bg-black/95 p-0 [&>button]:hidden">
                    <button
                        type="button"
                        onClick={() => setLightboxOpen(false)}
                        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    {image && (
                        <img
                            src={image}
                            alt={product.name}
                            className="max-h-[90vh] max-w-full object-contain p-6"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </main>
    );
}
