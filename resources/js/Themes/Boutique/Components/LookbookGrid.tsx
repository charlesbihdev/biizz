import type { CartItem, Product, ThemeSettings } from '@/types/business';
import MasonryGrid from './MasonryGrid';
import ProductListView from './ProductListView';
import UniformGrid from './UniformGrid';

interface Props {
    products:    Product[];
    onAddToCart: (item: CartItem) => void;
    settings:    ThemeSettings;
}

export default function LookbookGrid({ products, onAddToCart, settings }: Props) {
    const accent = settings.accent_color;

    if (products.length === 0) {
        return (
            <div className="py-24 text-center text-zinc-400">
                <p className="text-sm">No products available yet.</p>
            </div>
        );
    }

    if (settings.layout_style === 'masonry') {
        return <MasonryGrid products={products} onAddToCart={onAddToCart} accentColor={accent} />;
    }

    if (settings.layout_style === 'list') {
        return <ProductListView products={products} onAddToCart={onAddToCart} accentColor={accent} />;
    }

    return <UniformGrid products={products} onAddToCart={onAddToCart} accentColor={accent} />;
}
