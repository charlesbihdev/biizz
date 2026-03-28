import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '@/types/business';

interface Props {
    primary:        string;
    items:          CartItem[];
    total:          number;
    itemCount:      number;
    updateQuantity: (id: number, qty: number) => void;
    removeFromCart:  (id: number) => void;
}

export default function OrderSummary({ primary, items, total, itemCount, updateQuantity, removeFromCart }: Props) {
    return (
        <aside className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold" style={{ color: primary }}>
                Order Summary ({itemCount})
            </h2>

            <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50">
                <ul className="divide-y divide-zinc-100">
                    {items.map((item) => (
                        <li key={item.id} className="flex gap-3 px-4 py-3">
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                            ) : (
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xl">📦</div>
                            )}
                            <div className="flex flex-1 flex-col gap-1 min-w-0">
                                <p className="truncate text-sm font-medium" style={{ color: primary }}>{item.name}</p>
                                <p className="text-sm font-semibold" style={{ color: primary + 'cc' }}>
                                    GHS {item.price.toFixed(2)}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-zinc-400"
                                    >
                                        <Minus className="h-2.5 w-2.5" />
                                    </button>
                                    <span className="min-w-5 text-center text-xs font-medium">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-zinc-400"
                                    >
                                        <Plus className="h-2.5 w-2.5" />
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="shrink-0 self-start p-1 text-zinc-300 transition hover:text-red-500"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="border-t border-zinc-100 px-4 py-3">
                    <div className="flex justify-between text-sm font-bold" style={{ color: primary }}>
                        <span>Total</span>
                        <span>GHS {total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
