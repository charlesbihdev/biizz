import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddProductModal } from '@/components/admin/products/AddProductModal';
import { ProductRow } from '@/components/admin/products/ProductRow';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { index } from '@/routes/businesses/products';
import type { Business, Product } from '@/types';

type Category = { id: number; name: string };

type Props = {
    business: Business;
    products: { data: Product[]; total: number };
    categories: Category[];
};

export default function ProductsIndex({ business, products, categories }: Props) {
    const [addOpen, setAddOpen] = useState(false);
    const b = { business: business.slug };

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
                    <button
                        type="button"
                        onClick={() => setAddOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-hover"
                    >
                        <Plus className="h-4 w-4" />
                        Add product
                    </button>
                </div>

                {products.data.length === 0 ? (
                    <div className="rounded-2xl border border-site-border bg-site-surface p-12 text-center">
                        <p className="text-sm font-medium text-site-fg">No products yet</p>
                        <p className="mt-1 text-xs text-site-muted">
                            Add your first product to start selling.
                        </p>
                        <button
                            type="button"
                            onClick={() => setAddOpen(true)}
                            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                        >
                            <Plus className="h-4 w-4" /> Add product
                        </button>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-site-border bg-white">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-site-border bg-site-surface">
                                    <th className="py-2.5 pl-4 pr-3 text-xs font-semibold uppercase tracking-wide text-site-muted">Product</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Price</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Stock</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Status</th>
                                    <th className="py-2.5 pl-3 pr-4" />
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.map((product) => (
                                    <ProductRow
                                        key={product.id}
                                        business={business}
                                        product={product}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AddProductModal
                business={business}
                categories={categories}
                open={addOpen}
                onOpenChange={setAddOpen}
            />
        </AppSidebarLayout>
    );
}
