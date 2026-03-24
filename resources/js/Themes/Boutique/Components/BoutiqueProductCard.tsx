import type { CartItem, Product } from '@/types/business';

interface Props {
    product:     Product;
    onAddToCart: (item: CartItem) => void;
    accentColor?: string;
    aspectClass?: string; // allow masonry to override
}

export default function BoutiqueProductCard({ product, onAddToCart, accentColor, aspectClass = 'aspect-[3/4]' }: Props) {
    const image    = product.images[0]?.url;
    const price    = parseFloat(product.price);
    const outStock = product.stock === 0;

    const handleAdd = () => {
        if (outStock) { return; }
        onAddToCart({ id: product.id, name: product.name, price, quantity: 1, image });
    };

    return (
        <div className="group">
            {/* Image container */}
            <div className={`relative overflow-hidden bg-zinc-100 ${aspectClass}`}>
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-zinc-100">
                        <span className="text-4xl opacity-20">📦</span>
                    </div>
                )}

                {/* Hover overlay with CTA */}
                <div className="absolute inset-0 flex items-end bg-black/0 transition-all duration-300 group-hover:bg-black/30">
                    <div className="w-full translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0">
                        {outStock ? (
                            <p className="w-full rounded-lg bg-white/90 py-3 text-center text-sm font-semibold text-zinc-500">
                                Sold Out
                            </p>
                        ) : (
                            <button
                                onClick={handleAdd}
                                className="w-full rounded-lg py-3 text-sm font-bold text-white transition hover:opacity-90"
                                style={{ backgroundColor: accentColor ?? '#1a1a1a' }}
                            >
                                Add to Bag
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="mt-3 space-y-0.5">
                <p className="text-sm font-medium text-zinc-900 line-clamp-1">{product.name}</p>
                <p className="text-sm font-semibold text-zinc-700">
                    GHS {price.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        </div>
    );
}
