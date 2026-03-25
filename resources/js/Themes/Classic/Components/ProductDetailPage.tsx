import { useState } from 'react';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
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
    const [activeImage, setActiveImage] = useState(0);
    const primary     = primaryColor ?? '#18181b';
    const accent      = accentColor  ?? primary;
    const price       = parseFloat(product.price);
    const outOfStock  = !isDigital && product.stock === 0;
    const lowStock    = !isDigital && !outOfStock && product.stock <= 5;

    const images = product.images;
    const image  = images[activeImage]?.url ?? null;

    const handleAdd = () => {
        if (outOfStock) { return; }
        onAddToCart({ id: product.id, name: product.name, price, quantity: 1, image: images[0]?.url });
    };

    const textMuted = primary + 'b3'; // 70%

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm" style={{ color: textMuted }}>
                <a
                    href={`/s/${businessSlug}`}
                    className="flex items-center gap-1 transition"
                    style={{ color: textMuted }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = primary; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = textMuted; }}
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back to shop
                </a>
                {product.category && (
                    <>
                        <span>/</span>
                        <a
                            href={`/s/${businessSlug}?category=${product.category.slug}`}
                            className="transition"
                            style={{ color: textMuted }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = primary; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = textMuted; }}
                        >
                            {product.category.name}
                        </a>
                    </>
                )}
                <span>/</span>
                <span style={{ color: primary }}>{product.name}</span>
            </nav>

            {/* Product layout */}
            <div className="grid gap-10 lg:grid-cols-5">
                {/* Image gallery — 3/5 width */}
                <div className="lg:col-span-3">
                    <div className="aspect-square overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50">
                        {image ? (
                            <img src={image} alt={product.name} className="h-full w-full object-contain p-4" />
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
                        <a
                            href={`/s/${businessSlug}?category=${product.category.slug}`}
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: accent }}
                        >
                            {product.category.name}
                        </a>
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
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={outOfStock}
                            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                            style={{ backgroundColor: accent }}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {outOfStock ? 'Out of stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Related products */}
            {related.length > 0 && (
                <section className="mt-16">
                    <h2 className="mb-6 text-lg font-bold" style={{ color: primary }}>You might also like</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                        {related.map((rel) => (
                            <a key={rel.id} href={`/s/${businessSlug}/p/${rel.slug}`} className="block">
                                <ProductCard
                                    product={rel}
                                    onAddToCart={onAddToCart}
                                    accentColor={accentColor}
                                    primaryColor={primaryColor}
                                    isDigital={isDigital}
                                />
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
