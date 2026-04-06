import { Link } from '@inertiajs/react';
import ProductCard from '@/components/marketplace/ProductCard';
import type { PaginatedData, Product } from '@/types';

type MarketplaceProduct = Product & {
    business: { name: string; slug: string; logo_url: string | null };
};

interface Props {
    products: PaginatedData<MarketplaceProduct>;
}

function SkeletonCard() {
    return (
        <div className="animate-pulse overflow-hidden rounded-2xl border border-site-border">
            <div className="aspect-[4/3] bg-site-surface" />
            <div className="flex flex-col gap-3 p-4">
                <div className="h-3 w-2/3 rounded-full bg-site-surface" />
                <div className="h-4 rounded-full bg-site-surface" />
                <div className="h-4 w-4/5 rounded-full bg-site-surface" />
                <div className="h-3 w-1/3 rounded-full bg-site-surface" />
            </div>
        </div>
    );
}

export default function ProductGrid({ products }: Props) {
    if (products.data.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
                <p className="text-2xl font-bold text-site-fg">Nothing here yet</p>
                <p className="max-w-xs text-sm text-site-muted">
                    No products match your current filters. Try a different tag or search term.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <p className="text-xs text-site-muted">
                Showing {products.data.length} of {products.total} products
            </p>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* Pagination */}
            {(products.prev_page_url || products.next_page_url) && (
                <div className="flex items-center justify-center gap-3">
                    {products.prev_page_url ? (
                        <Link
                            href={products.prev_page_url}
                            className="rounded-full border border-site-border px-5 py-2 text-xs font-medium text-site-muted transition hover:border-brand hover:text-brand"
                        >
                            Previous
                        </Link>
                    ) : (
                        <span className="rounded-full border border-site-border px-5 py-2 text-xs font-medium text-site-muted opacity-40">
                            Previous
                        </span>
                    )}
                    <span className="text-xs text-site-muted">
                        Page {products.current_page} of {products.last_page}
                    </span>
                    {products.next_page_url ? (
                        <Link
                            href={products.next_page_url}
                            className="rounded-full border border-site-border px-5 py-2 text-xs font-medium text-site-muted transition hover:border-brand hover:text-brand"
                        >
                            Next
                        </Link>
                    ) : (
                        <span className="rounded-full border border-site-border px-5 py-2 text-xs font-medium text-site-muted opacity-40">
                            Next
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

export { SkeletonCard };
