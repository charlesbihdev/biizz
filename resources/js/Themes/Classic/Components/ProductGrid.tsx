import type { CartItem, Category, Product } from '@/types/business';
import ProductCard from './ProductCard';

interface Props {
    products:       Product[];
    onAddToCart:    (item: CartItem) => void;
    accentColor?:   string;
    activeCategory: Category | null;
    isDigital?:     boolean;
}

export default function ProductGrid({ products, onAddToCart, accentColor, activeCategory, isDigital }: Props) {
    const heading = activeCategory ? activeCategory.name : 'All Products';

    return (
        <section id="products" className="px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-baseline justify-between">
                    <h2 className="text-xl font-bold text-zinc-900">{heading}</h2>
                    <p className="text-sm text-zinc-500">{products.length} item{products.length !== 1 ? 's' : ''}</p>
                </div>

                {products.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-300 py-20 text-center">
                        <p className="text-sm text-zinc-400">No products in this category yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={onAddToCart}
                                accentColor={accentColor}
                                isDigital={isDigital}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
