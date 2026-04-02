import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    price: string;
    stock: string;
    isDigital: boolean;
    errors: { price?: string; stock?: string };
    onChange: (field: 'price' | 'stock', value: string) => void;
}

export function ProductPricingCard({ price, stock, isDigital, errors, onChange }: Props) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-site-border bg-white p-4">
            <p className="text-xs font-semibold tracking-wide text-site-muted uppercase">
                Pricing
            </p>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="price">Price (GHS) <span className="text-red-500">*</span></Label>
                <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => onChange('price', e.target.value)}
                    placeholder="0.00"
                    required
                    className="border-site-border focus-visible:ring-brand/30"
                />
                <InputError message={errors.price} />
            </div>

            {isDigital ? (
                <div className="flex flex-col gap-1.5">
                    <Label>Stock</Label>
                    <p className="rounded-lg border border-site-border bg-site-surface px-3 py-2 text-sm text-site-muted">
                        Unlimited — digital product
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="stock">Stock <span className="text-red-500">*</span></Label>
                    <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) => onChange('stock', e.target.value)}
                        required
                        className="border-site-border focus-visible:ring-brand/30"
                    />
                    <InputError message={errors.stock} />
                </div>
            )}
        </div>
    );
}
