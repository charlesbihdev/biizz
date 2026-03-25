import type { CartItem, Category, Product } from '@/types/business';
import ProductCard from './ProductCard';

interface Props {
    products:       Product[];
    onAddToCart:    (item: CartItem) => void;
    accentColor?:   string;
    primaryColor?:  string;
    activeCategory: Category | null;
    isDigital?:     boolean;
    businessSlug?:  string;
}

export default function ProductGrid({ products, onAddToCart, accentColor, primaryColor, activeCategory, isDigital, businessSlug }: Props) {
    const heading   = activeCategory ? activeCategory.name : 'All Products';
    const primary   = primaryColor ?? '#18181b';
    const textMuted = primary + '80'; // 50% opacity

    return (
        <section id="products" className="px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-baseline justify-between">
                    <h2 className="text-xl font-bold" style={{ color: primary }}>{heading}</h2>
                    <p className="text-sm" style={{ color: textMuted }}>{products.length} item{products.length !== 1 ? 's' : ''}</p>
                </div>

                {products.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 py-20 text-center">
                        <p className="text-sm" style={{ color: textMuted }}>No products in this category yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={onAddToCart}
                                accentColor={accentColor}
                                primaryColor={primaryColor}
                                isDigital={isDigital}
                                businessSlug={businessSlug}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
