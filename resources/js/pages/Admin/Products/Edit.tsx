import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { edit, index, update } from '@/routes/businesses/products';
import type { Business, Product } from '@/types';

type Category = { id: number; name: string };

type Props = {
    business: Business;
    product: Product;
    categories: Category[];
};

export default function EditProduct({ business, product, categories }: Props) {
    const b = { business: business.slug };

    const { data, setData, submit, processing, errors } = useForm({
        name:        product.name,
        description: product.description ?? '',
        price:       product.price,
        stock:       String(product.stock),
        category_id: product.category_id ? String(product.category_id) : '',
        is_active:   product.is_active,
    });

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name,  href: show(b).url },
                { title: 'Products',     href: index(b).url },
                { title: product.name,   href: edit({ ...b, product: product.id }).url },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-site-fg">Edit product</h1>
                        <p className="mt-1 text-sm text-site-muted">{product.name}</p>
                    </div>
                </div>

                <div className="max-w-lg">
                    <form
                        onSubmit={(e) => { e.preventDefault(); submit(update({ ...b, product: product.id })); }}
                        className="flex flex-col gap-5"
                    >
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                autoFocus
                                className="border-site-border focus-visible:ring-brand/30"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full rounded-lg border border-site-border px-3 py-2 text-sm text-site-fg placeholder:text-site-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                            />
                            <InputError message={errors.description} />
                        </div>

                        {categories.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="category_id">Category <span className="text-site-muted">(optional)</span></Label>
                                <select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="w-full rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                                >
                                    <option value="">No category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="price">Price (GHS)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="border-site-border focus-visible:ring-brand/30"
                                />
                                <InputError message={errors.price} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="stock">Stock</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    min="0"
                                    value={data.stock}
                                    onChange={(e) => setData('stock', e.target.value)}
                                    className="border-site-border focus-visible:ring-brand/30"
                                />
                                <InputError message={errors.stock} />
                            </div>
                        </div>

                        <label className="flex cursor-pointer items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded border-site-border accent-brand"
                            />
                            <span className="text-sm text-site-fg">Visible on storefront</span>
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-1 flex items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Save changes
                        </button>
                    </form>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
