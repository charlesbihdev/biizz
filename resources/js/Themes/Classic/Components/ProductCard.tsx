import { Download, ShoppingCart } from 'lucide-react';
import type { CartItem, Product } from '@/types/business';

interface Props {
    product:      Product;
    onAddToCart:  (item: CartItem) => void;
    accentColor?: string;
    isDigital?:   boolean;
}

export default function ProductCard({ product, onAddToCart, accentColor, isDigital }: Props) {
    const image    = product.images[0]?.url;
    const price    = parseFloat(product.price);
    const outStock = !isDigital && product.stock === 0;
    const lowStock = !isDigital && !outStock && product.stock <= 5;

    const handleAdd = () => {
        if (outStock) { return; }
        onAddToCart({ id: product.id, name: product.name, price, quantity: 1, image });
    };

    return (
        <div className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            {/* Image container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-zinc-100">
                        <span className="text-4xl opacity-30">📦</span>
                    </div>
                )}

                {/* Badges */}
                {isDigital && (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        <Download className="h-2.5 w-2.5" />
                        Digital
                    </span>
                )}
                {outStock && (
                    <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Out of stock
                    </span>
                )}
                {lowStock && (
                    <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Only {product.stock} left
                    </span>
                )}

                {/* Quick add overlay on hover */}
                {!outStock && (
                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-3 transition-transform duration-200 group-hover:translate-y-0">
                        <button
                            onClick={handleAdd}
                            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-white transition hover:opacity-90"
                            style={{ backgroundColor: accentColor ?? '#1a1a1a' }}
                        >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Add to Cart
                        </button>
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="line-clamp-2 text-sm font-medium text-zinc-900 leading-snug">{product.name}</p>
                {product.category && (
                    <p className="text-xs text-zinc-400">{product.category.name}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-2">
                    <p className="text-sm font-bold text-zinc-900">
                        GHS {price.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {outStock ? (
                        <span className="text-xs font-medium text-zinc-400">Unavailable</span>
                    ) : (
                        <button
                            onClick={handleAdd}
                            aria-label={`Add ${product.name} to cart`}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition hover:border-transparent hover:text-white sm:hidden"
                            style={{ ['--hover-bg' as string]: accentColor ?? '#1a1a1a' }}
                        >
                            <ShoppingCart className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
