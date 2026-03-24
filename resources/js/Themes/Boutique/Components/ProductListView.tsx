import type { CartItem, Product } from '@/types/business';

interface Props {
    products:     Product[];
    onAddToCart:  (item: CartItem) => void;
    accentColor?: string;
}

export default function ProductListView({ products, onAddToCart, accentColor }: Props) {
    return (
        <div className="divide-y divide-zinc-100">
            {products.map((product) => {
                const image    = product.images[0]?.url;
                const price    = parseFloat(product.price);
                const outStock = product.stock === 0;

                return (
                    <div key={product.id} className="flex gap-5 py-6">
                        {/* Image */}
                        <div className="aspect-square h-28 shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:h-36">
                            {image ? (
                                <img src={image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-3xl opacity-20">📦</div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 flex-col justify-between">
                            <div>
                                <h3 className="font-medium text-zinc-900">{product.name}</h3>
                                {product.description && (
                                    <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{product.description}</p>
                                )}
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <p className="text-base font-bold text-zinc-900">
                                    GHS {price.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                {outStock ? (
                                    <span className="text-sm text-zinc-400">Sold Out</span>
                                ) : (
                                    <button
                                        onClick={() => onAddToCart({ id: product.id, name: product.name, price, quantity: 1, image })}
                                        className="rounded-full px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
                                        style={{ backgroundColor: accentColor ?? '#1a1a1a' }}
                                    >
                                        Add to Bag
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
