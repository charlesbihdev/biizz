import type { CartItem, Product } from '@/types/business';
import BoutiqueProductCard from './BoutiqueProductCard';

interface Props {
    products:     Product[];
    onAddToCart:  (item: CartItem) => void;
    accentColor?: string;
}

export default function UniformGrid({ products, onAddToCart, accentColor }: Props) {
    return (
        <div className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
                <BoutiqueProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    accentColor={accentColor}
                    aspectClass="aspect-[3/4]"
                />
            ))}
        </div>
    );
}
