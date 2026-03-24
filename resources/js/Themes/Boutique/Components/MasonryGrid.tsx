import type { CartItem, Product } from '@/types/business';
import BoutiqueProductCard from './BoutiqueProductCard';

interface Props {
    products:     Product[];
    onAddToCart:  (item: CartItem) => void;
    accentColor?: string;
}

export default function MasonryGrid({ products, onAddToCart, accentColor }: Props) {
    return (
        <div className="columns-2 gap-1 space-y-1 md:columns-3 lg:columns-4">
            {products.map((product, index) => (
                <div key={product.id} className="break-inside-avoid">
                    <BoutiqueProductCard
                        product={product}
                        onAddToCart={onAddToCart}
                        accentColor={accentColor}
                        aspectClass={index % 3 === 1 ? 'aspect-[4/5]' : 'aspect-[3/4]'}
                    />
                </div>
            ))}
        </div>
    );
}
