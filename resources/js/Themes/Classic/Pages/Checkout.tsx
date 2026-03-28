import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import ClassicThemeShell from '../ThemeShell';
import WhatsAppCheckout from '../Components/WhatsAppCheckout';
import PaymentCheckout from '../Components/PaymentCheckout';
import { useCartStore } from '@/stores/cartStore';
import type { Business, Page } from '@/types/business';

interface Props {
    business:    Business;
    pages:       Page[];
    hasPayment:  boolean;
}

function CheckoutContent({ business, hasPayment }: { business: Business; hasPayment: boolean }) {
    const { itemCount } = useCartStore();

    const { theme_settings: s } = business;
    const primary = s.primary_color ?? '#1a1a1a';
    const accent  = s.accent_color  ?? primary;

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

    if (!hasPayment) {
        return <WhatsAppCheckout business={business} primary={primary} />;
    }

    return <PaymentCheckout business={business} primary={primary} accent={accent} />;
}

export default function Checkout({ business, pages, hasPayment }: Props) {
    return (
        <ClassicThemeShell business={business} pages={pages}>
            <CheckoutContent business={business} hasPayment={hasPayment} />
        </ClassicThemeShell>
    );
}
