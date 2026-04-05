import type { CompactProduct } from '@/types/business';

interface Props {
    value?:    number | null;
    products:  CompactProduct[];
    onChange:  (id: number | null) => void;
}

export function ProductPickerField({ value, products, onChange }: Props) {
    if (products.length === 0) {
        return (
            <p className="rounded-xl border border-site-border bg-site-surface px-4 py-3 text-sm text-site-muted">
                No active products found. Add a product first, then come back to select it.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {products.map((product) => {
                const selected = value === product.id;
                return (
                    <label
                        key={product.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                            selected
                                ? 'border-brand bg-brand/5'
                                : 'border-site-border hover:border-zinc-400 hover:bg-site-surface'
                        }`}
                    >
                        <input
                            type="radio"
                            name="featured_product_id"
                            value={product.id}
                            checked={selected}
                            onChange={() => onChange(product.id)}
                            className="accent-brand shrink-0"
                        />
                        {product.image && (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-10 w-8 shrink-0 rounded object-cover"
                            />
                        )}
                        <span className="text-sm font-medium text-site-fg">{product.name}</span>
                    </label>
                );
            })}

            {value != null && (
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="self-start text-xs text-site-muted underline underline-offset-2 transition hover:text-site-fg"
                >
                    Clear selection (use newest product)
                </button>
            )}
        </div>
    );
}
