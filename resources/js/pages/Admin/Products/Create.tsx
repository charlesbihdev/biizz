import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { create, index, store } from '@/routes/businesses/products';
import type { Business } from '@/types';

export default function CreateProduct({ business }: { business: Business }) {
    const b = { business: business.slug };

    const { data, setData, submit, processing, errors } = useForm({
        name: '',
        description: '',
        price: '',
        stock: '0',
        is_active: true as boolean,
    });

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: show(b).url },
                { title: 'Products', href: index(b).url },
                { title: 'New product', href: create(b).url },
            ]}
        >
            <div className="mx-auto max-w-lg p-6 lg:p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-site-fg">New product</h1>
                    <p className="mt-1 text-sm text-site-muted">Add a product to {business.name}.</p>
                </div>

                <form
                    onSubmit={(e) => { e.preventDefault(); submit(store(b)); }}
                    className="flex flex-col gap-5"
                >
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. White Linen Dress"
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
                            placeholder="Optional product description..."
                            className="w-full rounded-lg border border-site-border px-3 py-2 text-sm text-site-fg placeholder:text-site-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                        />
                        <InputError message={errors.description} />
                    </div>

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
                                placeholder="0.00"
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
                        Save product
                    </button>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
