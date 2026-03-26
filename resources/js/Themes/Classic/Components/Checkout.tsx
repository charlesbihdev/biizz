import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, Minus, Plus, Trash2 } from 'lucide-react';
import ClassicThemeShell from '../ThemeShell';
import { useCartStore } from '@/stores/cartStore';
import { useCheckout } from '@/Themes/Shared/Hooks/useCheckout';
import type { Business, Page } from '@/types/business';

interface Props {
    business: Business;
    pages:    Page[];
}

function CheckoutContent({ business }: { business: Business }) {
    const { items, total, itemCount, removeFromCart, updateQuantity } = useCartStore();
    const { submitOrder, isSubmitting, errors } = useCheckout(business.slug);

    const { theme_settings: s } = business;
    const primary = s.primary_color ?? '#1a1a1a';
    const accent  = s.accent_color  ?? primary;

    const [name, setName]   = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitOrder({ customer_name: name, customer_email: email, customer_phone: phone });
    };

    if (itemCount === 0) {
        return (
            <main className="mx-auto max-w-3xl px-6 py-16 text-center lg:px-8">
                <h1 className="mb-4 text-2xl font-bold" style={{ color: primary }}>Your cart is empty</h1>
                <p className="mb-8 text-sm text-zinc-500">Add some products before checking out.</p>
                <Link
                    href={`/s/${business.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: accent }}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Continue Shopping
                </Link>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center gap-2 text-sm" style={{ color: primary + 'b3' }}>
                <Link
                    href={`/s/${business.slug}`}
                    className="flex items-center gap-1 transition hover:opacity-80"
                    style={{ color: primary + 'b3' }}
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back to store
                </Link>
            </nav>

            <h1 className="mb-8 text-2xl font-bold" style={{ color: primary }}>Checkout</h1>

            <div className="grid gap-10 lg:grid-cols-5">
                {/* Customer Info Form */}
                <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-3">
                    <h2 className="text-lg font-semibold" style={{ color: primary }}>Your Details</h2>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                            placeholder="John Doe"
                        />
                        {errors.customer_name && <p className="mt-1 text-xs text-red-500">{errors.customer_name}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                            placeholder="john@example.com"
                        />
                        {errors.customer_email && <p className="mt-1 text-xs text-red-500">{errors.customer_email}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                            placeholder="+233 XX XXX XXXX"
                        />
                        {errors.customer_phone && <p className="mt-1 text-xs text-red-500">{errors.customer_phone}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                        style={{ backgroundColor: accent }}
                    >
                        {isSubmitting ? 'Placing Order...' : `Place Order — GHS ${total.toFixed(2)}`}
                    </button>
                </form>

                {/* Order Summary */}
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
            </div>
        </main>
    );
}

export default function Checkout({ business, pages }: Props) {
    return (
        <ClassicThemeShell business={business} pages={pages}>
            <CheckoutContent business={business} />
        </ClassicThemeShell>
    );
}
