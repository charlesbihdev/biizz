import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';
import { ChevronLeft } from 'lucide-react';
import OrderSummary from './OrderSummary';
import { useCartStore } from '@/stores/cartStore';
import { useCheckout } from '@/Themes/Shared/Hooks/useCheckout';
import { useJunipayCheckout } from '@/Themes/Shared/Hooks/useJunipayCheckout';
import type { Business } from '@/types/business';

// ─── Shared props ─────────────────────────────────────────────────────────────

interface Props {
    business: Business;
    primary:  string;
    accent:   string;
}

// ─── Shared form fields ───────────────────────────────────────────────────────

interface CustomerFormProps {
    primary:      string;
    accent:       string;
    total:        number;
    isSubmitting: boolean;
    errors:       Record<string, string>;
    name:         string;
    email:        string;
    phone:        string;
    onNameChange:  (v: string) => void;
    onEmailChange: (v: string) => void;
    onPhoneChange: (v: string) => void;
    onSubmit:     (e: React.FormEvent) => void;
    buttonLabel:  string;
}

function CustomerForm({
    primary, accent, total,
    isSubmitting, errors,
    name, email, phone,
    onNameChange, onEmailChange, onPhoneChange,
    onSubmit, buttonLabel,
}: CustomerFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-5 lg:col-span-3">
            <h2 className="text-lg font-semibold" style={{ color: primary }}>Your Details</h2>

            {(errors._form || errors._script) && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errors._form ?? errors._script}
                </div>
            )}

            <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>
                    Full Name
                </label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
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
                    onChange={(e) => onEmailChange(e.target.value)}
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
                    onChange={(e) => onPhoneChange(e.target.value)}
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
                {isSubmitting ? 'Processing...' : `${buttonLabel} — GHS ${total.toFixed(2)}`}
            </button>
        </form>
    );
}

// ─── Paystack flow (redirect-based, unchanged) ────────────────────────────────

function PaystackCheckout({ business, primary, accent }: Props) {
    const { items, total, itemCount, removeFromCart, updateQuantity } = useCartStore();
    const { submitOrder, isSubmitting, errors } = useCheckout(business.slug);
    const { flash } = usePage<{ flash?: { error?: string } }>().props;
    const { customer } = useCustomerAuth();

    const [name, setName]   = useState(customer?.name  ?? '');
    const [email, setEmail] = useState(customer?.email ?? '');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitOrder({ customer_name: name, customer_email: email, customer_phone: phone });
    };

    return (
        <div className="grid gap-10 lg:grid-cols-5">
            {flash?.error && (
                <div className="lg:col-span-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {flash.error}
                </div>
            )}
            <CustomerForm
                primary={primary} accent={accent} total={total}
                isSubmitting={isSubmitting} errors={errors}
                name={name} email={email} phone={phone}
                onNameChange={setName} onEmailChange={setEmail} onPhoneChange={setPhone}
                onSubmit={handleSubmit}
                buttonLabel="Proceed to Payment"
            />
            <OrderSummary
                primary={primary} items={items} total={total}
                itemCount={itemCount} updateQuantity={updateQuantity} removeFromCart={removeFromCart}
            />
        </div>
    );
}

// ─── Junipay flow (inline JuniPop popup) ─────────────────────────────────────

function JunipayCheckout({ business, primary, accent }: Props) {
    const { items, total, itemCount, removeFromCart, updateQuantity } = useCartStore();
    const { submitOrder, isSubmitting, errors } = useJunipayCheckout(business.slug);
    const { customer } = useCustomerAuth();

    const [name, setName]   = useState(customer?.name  ?? '');
    const [email, setEmail] = useState(customer?.email ?? '');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitOrder({ customer_name: name, customer_email: email, customer_phone: phone });
    };

    return (
        <div className="grid gap-10 lg:grid-cols-5">
            <CustomerForm
                primary={primary} accent={accent} total={total}
                isSubmitting={isSubmitting} errors={errors}
                name={name} email={email} phone={phone}
                onNameChange={setName} onEmailChange={setEmail} onPhoneChange={setPhone}
                onSubmit={handleSubmit}
                buttonLabel="Pay Now"
            />
            <OrderSummary
                primary={primary} items={items} total={total}
                itemCount={itemCount} updateQuantity={updateQuantity} removeFromCart={removeFromCart}
            />
        </div>
    );
}

// ─── Entry point — branches on the business's configured provider ─────────────

export default function PaymentCheckout({ business, primary, accent }: Props) {
    const { flash } = usePage<{ flash?: { error?: string } }>().props;

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

            {business.default_payment_provider === 'junipay' ? (
                <JunipayCheckout business={business} primary={primary} accent={accent} />
            ) : (
                <PaystackCheckout business={business} primary={primary} accent={accent} />
            )}
        </main>
    );
}
