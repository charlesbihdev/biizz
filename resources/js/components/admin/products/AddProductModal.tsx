import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/businesses/products';
import type { Business } from '@/types';

type Category = { id: number; name: string };

type Props = {
    business: Business;
    categories: Category[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function AddProductModal({ business, categories, open, onOpenChange }: Props) {
    const b = { business: business.slug };

    const { data, setData, submit, processing, errors } = useForm({
        name:        '',
        description: '',
        price:       '',
        stock:       '0',
        category_id: '' as string,
        is_active:   true as boolean,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add product</DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={(e) => { e.preventDefault(); submit(store(b)); }}
                    className="flex flex-col gap-5 pt-2"
                >
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="p-name">Name</Label>
                        <Input
                            id="p-name"
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
                        <Label htmlFor="p-description">Description</Label>
                        <textarea
                            id="p-description"
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Optional product description..."
                            className="w-full rounded-lg border border-site-border px-3 py-2 text-sm text-site-fg placeholder:text-site-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                        />
                        <InputError message={errors.description} />
                    </div>

                    {categories.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="p-category">Category <span className="text-site-muted">(optional)</span></Label>
                            <select
                                id="p-category"
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
                            <Label htmlFor="p-price">Price (GHS)</Label>
                            <Input
                                id="p-price"
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
                            <Label htmlFor="p-stock">Stock</Label>
                            <Input
                                id="p-stock"
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
                        className="flex items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Save product
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
