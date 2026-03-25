import { router } from '@inertiajs/react';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import type { CartItem } from '@/types/business';

interface Props {
    isOpen:           boolean;
    onClose:          () => void;
    items:            CartItem[];
    total:            number;
    itemCount:        number;
    onRemove:         (id: number) => void;
    onUpdateQuantity: (id: number, quantity: number) => void;
    businessSlug:     string;
    accentColor?:     string;
    onCheckout:       () => void;
}

export default function CartDrawer({
    isOpen, onClose, items, total, itemCount,
    onRemove, onUpdateQuantity, businessSlug, accentColor, onCheckout,
}: Props) {
    if (!isOpen) { return null; }

    const handleCheckout = () => {
        onCheckout();
        router.post(`/s/${businessSlug}/checkout`, { items });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <aside className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-zinc-700" />
                        <h2 className="font-bold text-zinc-900">Cart ({itemCount})</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-zinc-400">
                        <ShoppingCart className="h-12 w-12 opacity-30" />
                        <p className="text-sm">Your cart is empty</p>
                    </div>
                ) : (
                    <>
                        <ul className="flex-1 divide-y divide-zinc-100 overflow-y-auto">
                            {items.map((item) => (
                                <li key={item.id} className="flex gap-3 px-5 py-4">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-2xl">
                                            📦
                                        </div>
                                    )}
                                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                                        <p className="truncate text-sm font-medium text-zinc-900">{item.name}</p>
                                        <p className="text-sm font-semibold text-zinc-800">
                                            GHS {item.price.toFixed(2)}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition hover:border-zinc-400"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="min-w-[1.5rem] text-center text-sm font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition hover:border-zinc-400"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onRemove(item.id)}
                                        className="shrink-0 self-start p-1 text-zinc-300 transition hover:text-red-500"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className="border-t border-zinc-100 px-5 py-5">
                            <div className="mb-4 flex justify-between text-base font-bold text-zinc-900">
                                <span>Total</span>
                                <span>GHS {total.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
                                style={{ backgroundColor: accentColor ?? '#1a1a1a' }}
                            >
                                Checkout
                            </button>
                        </div>
                    </>
                )}
            </aside>
        </div>
    );
}
