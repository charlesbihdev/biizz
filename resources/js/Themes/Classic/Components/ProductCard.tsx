import { Link } from '@inertiajs/react';
import { Download, ShoppingCart } from 'lucide-react';
import type { CartItem, Product } from '@/types/business';

interface Props {
    product:       Product;
    onAddToCart:   (item: CartItem) => void;
    accentColor?:  string;
    primaryColor?: string;
    isDigital?:    boolean;
    businessSlug?: string;
}

export default function ProductCard({ product, onAddToCart, accentColor, primaryColor, isDigital, businessSlug }: Props) {
    const image    = product.images[0]?.url;
    const price    = parseFloat(product.price);
    const outStock = !isDigital && product.stock === 0;
    const lowStock = !isDigital && !outStock && product.stock <= 5;

    const primary    = primaryColor ?? '#18181b';
    const accent     = accentColor  ?? primary;
    const textMuted  = primary + 'b3'; // 70% opacity
    const textSubtle = primary + '73'; // 45% opacity

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        if (outStock) { return; }
        onAddToCart({ id: product.id, name: product.name, price, quantity: 1, image });
    };

    const href = businessSlug ? `/s/${businessSlug}/p/${product.slug}` : undefined;

    const imageAndInfo = (
        <>
            {/* ── Image ── */}
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-50">
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-4xl opacity-20">📦</span>
                    </div>
                )}

                {isDigital && (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        <Download className="h-2.5 w-2.5" />
                        Digital
                    </span>
                )}
                {outStock && (
                    <span className="absolute left-2 top-2 rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                        Out of stock
                    </span>
                )}
                {lowStock && (
                    <span className="absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: accent }}>
                        Only {product.stock} left
                    </span>
                )}
            </div>

            {/* ── Info ── */}
            <div className="flex flex-col gap-1.5 p-3.5 pb-2">
                {product.category && (
                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: textSubtle }}>
                        {product.category.name}
                    </p>
                )}
                <p className="line-clamp-2 text-sm font-semibold leading-snug" style={{ color: primary }}>
                    {product.name}
                </p>
                <p className="mt-0.5 text-base font-bold" style={{ color: accent }}>
                    GHS {price.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        </>
    );

    return (
        <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            {href ? (
                <Link href={href} className="flex flex-1 flex-col">
                    {imageAndInfo}
                </Link>
            ) : (
                <div className="flex flex-1 flex-col">
                    {imageAndInfo}
                </div>
            )}

            {/* ── Button (outside link to avoid nesting) ── */}
            <div className="mt-auto px-3.5 pb-3.5">
                {outStock ? (
                    <div className="rounded-xl border border-zinc-200 py-2 text-center text-xs font-medium" style={{ color: textMuted }}>
                        Unavailable
                    </div>
                ) : (
                    <button
                        onClick={handleAdd}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
                        style={{ backgroundColor: accent }}
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        {isDigital ? 'Get Now' : 'Add to Cart'}
                    </button>
                )}
            </div>
        </div>
    );
}
