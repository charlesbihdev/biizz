import { useState } from 'react';
import { router } from '@inertiajs/react';
import type { CartItem } from '@/types/business';

interface Props {
    items:            CartItem[];
    total:            number;
    itemCount:        number;
    onRemove:         (id: number) => void;
    onUpdateQuantity: (id: number, quantity: number) => void;
    businessSlug:     string;
    primaryColor?:    string;
    onCheckout:       () => void;
}

export default function CartDrawer({
    items, total, itemCount, onRemove, onUpdateQuantity, businessSlug, primaryColor, onCheckout,
}: Props) {
    const [open, setOpen] = useState(false);

    const handleCheckout = () => {
        onCheckout();
        router.post(`/s/${businessSlug}/checkout`, { items });
    };

    return (
        <>
            {/* Floating cart button */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
                style={{ backgroundColor: primaryColor ?? '#1a1a1a' }}
            >
                🛒
                {itemCount > 0 && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold"
                          style={{ color: primaryColor ?? '#1a1a1a' }}>
                        {itemCount}
                    </span>
                )}
            </button>

            {/* Overlay */}
            {open && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
                    <aside className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                            <h2 className="font-bold text-zinc-900">Your Cart ({itemCount})</h2>
                            <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
                        </div>

                        {items.length === 0 ? (
                            <div className="flex flex-1 items-center justify-center text-zinc-400">
                                <p>Your cart is empty</p>
                            </div>
                        ) : (
                            <>
                                <ul className="flex-1 divide-y divide-zinc-100 overflow-y-auto">
                                    {items.map((item) => (
                                        <li key={item.id} className="flex gap-3 px-5 py-4">
                                            {item.image && (
                                                <img src={item.image} alt={item.name}
                                                     className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
                                            )}
                                            <div className="flex flex-1 flex-col gap-1">
                                                <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                                                <p className="text-sm text-zinc-500">
                                                    GHS {item.price.toFixed(2)}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                            className="flex h-6 w-6 items-center justify-center rounded border text-xs">−</button>
                                                    <span className="text-sm">{item.quantity}</span>
                                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                            className="flex h-6 w-6 items-center justify-center rounded border text-xs">+</button>
                                                </div>
                                            </div>
                                            <button onClick={() => onRemove(item.id)}
                                                    className="text-xs text-zinc-400 hover:text-red-500">Remove</button>
                                        </li>
                                    ))}
                                </ul>

                                <div className="border-t border-zinc-200 px-5 py-4">
                                    <div className="mb-4 flex justify-between text-sm font-semibold text-zinc-900">
                                        <span>Total</span>
                                        <span>GHS {total.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90"
                                        style={{ backgroundColor: primaryColor ?? '#1a1a1a' }}
                                    >
                                        Checkout
                                    </button>
                                </div>
                            </>
                        )}
                    </aside>
                </div>
            )}
        </>
    );
}
