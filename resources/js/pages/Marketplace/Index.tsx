import { Head } from '@inertiajs/react';
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters';
import MarketplaceFooter from '@/components/marketplace/MarketplaceFooter';
import MarketplaceHero from '@/components/marketplace/MarketplaceHero';
import MarketplaceNav from '@/components/marketplace/MarketplaceNav';
import ProductGrid from '@/components/marketplace/ProductGrid';
import type { PaginatedData, Product } from '@/types';

type MarketplaceProduct = Product & {
    business: { name: string; slug: string; logo_url: string | null };
};

interface ActiveFilters {
    search?:   string;
    category?: string;
}

interface Props {
    products:      PaginatedData<MarketplaceProduct>;
    activeFilters: ActiveFilters;
}

export default function MarketplaceIndex({ products, activeFilters }: Props) {
    return (
        <>
            <Head title="Marketplace — biizz.app">
                <meta name="description" content="Discover ebooks, courses, and digital playbooks from African creators shipping real results." />
            </Head>

            <div className="min-h-screen bg-site-bg">
                <MarketplaceNav />

                <MarketplaceHero
                    initialSearch={activeFilters.search}
                    total={products.total}
                />

                <MarketplaceFilters
                    activeCategory={activeFilters.category}
                    activeSearch={activeFilters.search}
                />

                <main className="mx-auto max-w-6xl px-5 py-10">
                    <ProductGrid products={products} />
                </main>

                <MarketplaceFooter />
            </div>
        </>
    );
}
