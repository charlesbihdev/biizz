import { Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { ChevronLeft, Lock } from 'lucide-react';
import ClassicThemeShell, { type CartActions } from '../ThemeShell';
import WhatsAppCheckout from '../Components/WhatsAppCheckout';
import PaymentCheckout from '../Components/PaymentCheckout';
import { useCartStore } from '@/stores/cartStore';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';
import { useSemanticTokens } from '@/Themes/Shared/Hooks/useSemanticTokens';
import type { Business, Page, CustomerAddress } from '@/types/business';

interface Props {
    business:   Business;
    pages:      Page[];
    hasPayment: boolean;
    addresses?: CustomerAddress[];
}

function CheckoutContent({
    business,
    hasPayment,
    openAuth,
    addresses,
}: {
    business:  Business;
    hasPayment: boolean;
    openAuth:  CartActions['openAuth'];
    addresses?: CustomerAddress[];
}) {
    const { itemCount } = useCartStore();
    const { requiresLoginForCheckout } = useCustomerAuth();

    useEffect(() => {
        if (requiresLoginForCheckout) {
            openAuth();
        }
    }, [requiresLoginForCheckout]);

    const tokens  = useSemanticTokens(business);
    const primary = tokens.textPrimary;
    const accent  = tokens.ctaBg;

    // Auth wall — modal is open above this placeholder
    if (requiresLoginForCheckout) {
        return (
            <main className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
                    <Lock className="h-6 w-6 text-zinc-400" />
                </div>
                <h1 className="mb-2 text-xl font-semibold text-zinc-800">Sign in to continue</h1>
                <p className="text-sm text-zinc-500">You need an account to place an order at {business.name}.</p>
            </main>
        );
    }

    if (itemCount === 0) {
        return (
            <main className="mx-auto max-w-3xl px-6 py-16 text-center lg:px-8">
                <h1 className="mb-4 text-2xl font-bold" style={{ color: primary }}>Your cart is empty</h1>
                <p className="mb-8 text-sm text-zinc-500">Add some products before checking out.</p>
                <Link
                    href={`/s/${business.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition hover:opacity-90"
                    style={{ backgroundColor: tokens.ctaBg, color: tokens.ctaFg }}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Continue Shopping
                </Link>
            </main>
        );
    }

    if (!hasPayment) {
        return <WhatsAppCheckout business={business} primary={primary} addresses={addresses} />;
    }

    return <PaymentCheckout business={business} primary={primary} accent={accent} addresses={addresses} />;
}

export default function Checkout({ business, pages, hasPayment, addresses }: Props) {
    return (
        <ClassicThemeShell business={business} pages={pages}>
            {(actions) => (
                <CheckoutContent
                    business={business}
                    hasPayment={hasPayment}
                    openAuth={actions.openAuth}
                    addresses={addresses}
                />
            )}
        </ClassicThemeShell>
    );
}
