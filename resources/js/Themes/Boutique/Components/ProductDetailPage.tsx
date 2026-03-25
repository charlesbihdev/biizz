import { useState } from 'react';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import type { CartItem, Product } from '@/types/business';
import BoutiqueProductCard from './BoutiqueProductCard';

interface Props {
    businessSlug:  string;
    product:       Product;
    related:       Product[];
    accentColor?:  string;
    isDigital?:    boolean;
    onAddToCart:   (item: CartItem) => void;
}

export default function BoutiqueProductDetailPage({ businessSlug, product, related, accentColor, isDigital, onAddToCart }: Props) {
    const [activeImage, setActiveImage] = useState(0);
    const accent     = accentColor ?? '#18181b';
    const price      = parseFloat(product.price);
    const outOfStock = !isDigital && product.stock === 0;
    const lowStock   = !isDigital && !outOfStock && product.stock <= 5;

    const images = product.images;
    const image  = images[activeImage]?.url ?? null;

    const handleAdd = () => {
        if (outOfStock) { return; }
        onAddToCart({ id: product.id, name: product.name, price, quantity: 1, image: images[0]?.url });
    };

    return (
        <main className="pt-20">
            {/* Full-width hero image */}
            <div className="relative aspect-[16/7] w-full overflow-hidden bg-zinc-100">
                {image ? (
                    <img src={image} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center text-8xl opacity-10">📦</div>
                )}
            </div>

            <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
                {/* Back link */}
                <a
                    href={`/s/${businessSlug}`}
                    className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 transition hover:text-zinc-900"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back
                </a>

                <div className="grid gap-12 lg:grid-cols-2">
                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex flex-col gap-3">
                            {images.map((img, i) => (
                                <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => setActiveImage(i)}
                                    className={`overflow-hidden rounded-lg border-2 transition ${
                                        i === activeImage ? 'border-zinc-900' : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img src={img.url} alt={img.alt ?? product.name} className="h-24 w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Product info */}
                    <div className="flex flex-col gap-6">
                        {product.category && (
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                                {product.category.name}
                            </p>
                        )}

                        <h1 className="text-3xl font-bold leading-tight text-zinc-900 lg:text-4xl">
                            {product.name}
                        </h1>

                        <p className="text-2xl font-light text-zinc-900">
                            GHS {price.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>

                        {!isDigital && (
                            <p className={`text-xs font-semibold uppercase tracking-wider ${
                                outOfStock ? 'text-red-500' : lowStock ? 'text-amber-600' : 'text-zinc-400'
                            }`}>
                                {outOfStock ? 'Sold out' : lowStock ? `Only ${product.stock} remaining` : 'Available'}
                            </p>
                        )}

                        {product.description && (
                            <div
                                className="prose prose-sm max-w-none text-zinc-500"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        )}

                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={outOfStock}
                            className="flex w-full items-center justify-center gap-2 rounded-none border border-zinc-900 py-4 text-xs font-bold uppercase tracking-widest text-zinc-900 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            {outOfStock ? 'Sold Out' : 'Add to Bag'}
                        </button>
                    </div>
                </div>

                {/* Related */}
                {related.length > 0 && (
                    <section className="mt-20">
                        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                            You may also like
                        </p>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {related.map((rel) => (
                                <a key={rel.id} href={`/s/${businessSlug}/p/${rel.slug}`} className="block">
                                    <BoutiqueProductCard product={rel} onAddToCart={onAddToCart} accentColor={accentColor} />
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
