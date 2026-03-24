import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { Business, PaginatedData, Product } from '@/types/business';
import { useCart } from '@/Themes/Shared/Hooks/useCart';
import { useMetaPixel } from '@/Themes/Shared/Hooks/useMetaPixel';
import CartDrawer from '@/Themes/Shared/Components/CartDrawer';
import CategoryFilter from './Components/CategoryFilter';
import HeroSection from './Components/HeroSection';
import Pagination from './Components/Pagination';
import ProductGrid from './Components/ProductGrid';
import StorefrontNav from './Components/StorefrontNav';
import StoreFooter from './Components/StoreFooter';

interface Props {
    business: Business;
    products: PaginatedData<Product>;
}

export default function ClassicLayout({ business, products }: Props) {
    const { items, addToCart, removeFromCart, updateQuantity, total, itemCount } = useCart();
    const { trackEvent } = useMetaPixel(business.meta_pixel_id ?? '');
    const [cartOpen, setCartOpen] = useState(false);

    const { theme_settings: s } = business;

    // Determine active category from URL
    const activeCategoryId = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('category');
        return cat ? Number(cat) : null;
    }, []);

    const categories = business.categories ?? [];

    const handleCategoryChange = (id: number | null) => {
        const url = new URL(window.location.href);
        if (id === null) {
            url.searchParams.delete('category');
        } else {
            url.searchParams.set('category', String(id));
        }
        url.searchParams.delete('page'); // reset pagination on category change
        router.visit(url.pathname + url.search, { preserveScroll: false });
    };

    const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? null;

    const handleAddToCart = (item: Parameters<typeof addToCart>[0]) => {
        addToCart(item);
        trackEvent('AddToCart', { content_name: item.name, value: item.price, currency: 'GHS' });
    };

    return (
        <div className="min-h-screen bg-white font-sans antialiased">
            <StorefrontNav
                business={business}
                itemCount={itemCount}
                onCartOpen={() => setCartOpen(true)}
            />

            {s.show_hero !== false && <HeroSection business={business} />}

            <CategoryFilter
                categories={categories}
                activeId={activeCategoryId}
                onChange={handleCategoryChange}
                primaryColor={s.primary_color}
            />

            <ProductGrid
                products={products.data}
                onAddToCart={handleAddToCart}
                accentColor={s.primary_color}
                activeCategory={activeCategory}
                isDigital={business.business_type === 'digital'}
            />

            <Pagination data={products} accentColor={s.primary_color} />

            <StoreFooter business={business} />

            <CartDrawer
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                items={items}
                total={total}
                itemCount={itemCount}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
                businessSlug={business.slug}
                accentColor={s.primary_color}
                onCheckout={() => trackEvent('InitiateCheckout', { value: total, currency: 'GHS' })}
            />
        </div>
    );
}
