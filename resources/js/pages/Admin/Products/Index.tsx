import { Link } from '@inertiajs/react';
import { Plus, Package } from 'lucide-react';
import { useState } from 'react';
import { ProductDetailModal } from '@/components/admin/products/ProductDetailModal';
import { ProductFilters } from '@/components/admin/products/ProductFilters';
import type { ProductFiltersState } from '@/components/admin/products/ProductFilters';
import { ProductOversoldBanner } from '@/components/admin/products/ProductOversoldBanner';
import { ProductRow } from '@/components/admin/products/ProductRow';
import { ProductStatsRow } from '@/components/admin/products/ProductStatsRow';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { create, index } from '@/routes/businesses/products';
import type { Business, Product, ProductStats } from '@/types';

type Category = { id: number; name: string };

type PaginatedProducts = {
    data: Product[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

type Props = {
    business: Business;
    products: PaginatedProducts;
    categories: Category[];
    filters: ProductFiltersState;
    stats?: ProductStats;
};

export default function ProductsIndex({ business, products, categories, filters, stats }: Props) {
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const b = { business: business.slug };
    const isDigital = business.business_type === 'digital';
    const categoryName = filters.category
        ? categories.find((c) => String(c.id) === String(filters.category))?.name
        : undefined;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: show(b).url },
                { title: 'Products', href: index(b).url },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-site-fg">Products</h1>
                        <p className="mt-0.5 text-sm text-site-muted">{products.total} total</p>
                    </div>
                    <Link
                        href={create(b).url}
                        className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-hover"
                    >
                        <Plus className="h-4 w-4" />
                        Add product
                    </Link>
                </div>

                {!isDigital && <ProductOversoldBanner stats={stats} />}

                <ProductStatsRow
                    stats={stats}
                    filters={filters}
                    isDigital={isDigital}
                    categoryName={categoryName}
                />

                <ProductFilters indexUrl={index(b).url} filters={filters} categories={categories} />

                {products.data.length === 0 ? (
                    <div className="rounded-2xl border border-site-border bg-site-surface p-12 text-center">
                        <Package className="mx-auto mb-3 h-8 w-8 text-site-muted" />
                        <p className="text-sm font-medium text-site-fg">No products found</p>
                        <p className="mt-1 text-xs text-site-muted">Try adjusting your filters or add a new product.</p>
                        <Link
                            href={create(b).url}
                            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                        >
                            <Plus className="h-4 w-4" /> Add product
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-site-border bg-white">
                        <table className="min-w-180 w-full text-left">
                            <thead>
                                <tr className="border-b border-site-border bg-site-surface">
                                    <th className="py-2.5 pl-4 pr-3 text-xs font-semibold uppercase tracking-wide text-site-muted">#</th>
                                    <th className="py-2.5 pl-4 pr-3 text-xs font-semibold uppercase tracking-wide text-site-muted">Product</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Price</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Stock</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Status</th>
                                    <th className="py-2.5 pl-3 pr-4" />
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.map((product, i) => (
                                    <ProductRow
                                        key={product.id}
                                        business={business}
                                        product={product}
                                        rowNumber={(products.current_page - 1) * products.per_page + i + 1}
                                        onView={setViewingProduct}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {(products.prev_page_url || products.next_page_url) && (
                    <div className="mt-4 flex justify-between">
                        <Link
                            href={products.prev_page_url ?? '#'}
                            className={`text-sm font-medium ${products.prev_page_url ? 'text-brand hover:underline' : 'pointer-events-none text-site-muted'}`}
                        >
                            ← Previous
                        </Link>
                        <span className="text-sm text-site-muted">Page {products.current_page} of {products.last_page}</span>
                        <Link
                            href={products.next_page_url ?? '#'}
                            className={`text-sm font-medium ${products.next_page_url ? 'text-brand hover:underline' : 'pointer-events-none text-site-muted'}`}
                        >
                            Next →
                        </Link>
                    </div>
                )}
            </div>

            <ProductDetailModal
                business={business}
                product={viewingProduct}
                onClose={() => setViewingProduct(null)}
            />
        </AppSidebarLayout>
    );
}
