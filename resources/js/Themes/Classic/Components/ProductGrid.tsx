import type { CartItem, Product } from '@/types/business';

interface Props {
    products:  Product[];
    onAddToCart: (item: CartItem) => void;
    primaryColor?: string;
}

export default function ProductGrid({ products, onAddToCart, primaryColor }: Props) {
    if (products.length === 0) {
        return (
            <div className="py-20 text-center text-zinc-500">
                <p className="text-lg">No products available yet.</p>
            </div>
        );
    }

    return (
        <section className="px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <h2 className="mb-8 text-2xl font-bold text-zinc-900">Our Products</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={onAddToCart}
                            primaryColor={primaryColor}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

interface CardProps {
    product:      Product;
    onAddToCart:  (item: CartItem) => void;
    primaryColor?: string;
}

function ProductCard({ product, onAddToCart, primaryColor }: CardProps) {
    const image = product.images[0]?.url;
    const price = parseFloat(product.price);

    return (
        <div className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
            <div className="aspect-square overflow-hidden bg-zinc-100">
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-zinc-300">
                        <span className="text-4xl">📦</span>
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col p-3">
                <p className="line-clamp-2 text-sm font-medium text-zinc-900">{product.name}</p>
                <p className="mt-1 text-sm font-bold text-zinc-900">
                    {price.toLocaleString('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 })}
                </p>
                <div className="mt-auto pt-3">
                    <button
                        onClick={() => onAddToCart({ id: product.id, name: product.name, price, quantity: 1, image })}
                        disabled={product.stock === 0}
                        className="w-full rounded-lg py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ backgroundColor: primaryColor ?? '#1a1a1a' }}
                    >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}
