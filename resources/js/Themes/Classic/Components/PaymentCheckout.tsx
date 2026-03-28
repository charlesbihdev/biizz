import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import OrderSummary from './OrderSummary';
import { useCartStore } from '@/stores/cartStore';
import { useCheckout } from '@/Themes/Shared/Hooks/useCheckout';
import type { Business } from '@/types/business';

export default function PaymentCheckout({ business, primary, accent }: { business: Business; primary: string; accent: string }) {
    const { items, total, itemCount, removeFromCart, updateQuantity } = useCartStore();
    const { submitOrder, isSubmitting, errors } = useCheckout(business.slug);
    const { flash } = usePage<{ flash?: { error?: string; success?: string } }>().props;

    const [name, setName]   = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitOrder({ customer_name: name, customer_email: email, customer_phone: phone });
    };

    return (
        <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
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

            {flash?.error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {flash.error}
                </div>
            )}

            <div className="grid gap-10 lg:grid-cols-5">
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
                        {isSubmitting ? 'Processing...' : `Proceed to Payment — GHS ${total.toFixed(2)}`}
                    </button>
                </form>

                <OrderSummary
                    primary={primary}
                    items={items}
                    total={total}
                    itemCount={itemCount}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                />
            </div>
        </main>
    );
}
