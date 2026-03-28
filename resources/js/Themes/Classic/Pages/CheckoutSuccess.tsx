import { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import ClassicThemeShell from '../ThemeShell';
import { useCartStore } from '@/stores/cartStore';
import type { Business, Order, Page } from '@/types/business';

interface Props {
    business: Business;
    order:    Order | null;
    pages:    Page[];
}

function SuccessContent({ business, order }: { business: Business; order: Order | null }) {
    const clearCart = useCartStore((s) => s.clearCart);

    const { theme_settings: s } = business;
    const primary = s.primary_color ?? '#1a1a1a';
    const accent  = s.accent_color  ?? primary;

    useEffect(() => {
        if (order?.status === 'paid') {
            clearCart();
        }
    }, [order?.status, clearCart]);

    return (
        <main className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
            <div className="text-center">
                {order ? (
                    <>
                        <CheckCircle className="mx-auto mb-5 h-16 w-16" style={{ color: accent }} />

                        <h1 className="mb-2 text-2xl font-bold" style={{ color: primary }}>
                            Thank you for your order!
                        </h1>

                        <p className="mb-1 text-sm text-zinc-500">Your order code is</p>
                        <p className="mb-8 text-xl font-bold tracking-widest" style={{ color: primary }}>
                            {order.order_id}
                        </p>
                    </>
                ) : (
                    <>
                        <ShoppingBag className="mx-auto mb-5 h-16 w-16 text-zinc-300" />

                        <h1 className="mb-2 text-2xl font-bold" style={{ color: primary }}>
                            Order Complete
                        </h1>
                        <p className="mb-8 text-sm text-zinc-500">Thank you for your purchase.</p>
                    </>
                )}
            </div>

            {order?.items && order.items.length > 0 && (
                <div className="mb-10 rounded-2xl border border-zinc-100 bg-zinc-50/50">
                    <div className="border-b border-zinc-100 px-5 py-3">
                        <h2 className="text-sm font-semibold" style={{ color: primary }}>Order Summary</h2>
                    </div>

                    <ul className="divide-y divide-zinc-100">
                        {order.items.map((item) => (
                            <li key={item.id} className="flex justify-between px-5 py-3 text-sm">
                                <span style={{ color: primary + 'cc' }}>
                                    {item.product_name} &times; {item.quantity}
                                </span>
                                <span className="font-medium" style={{ color: primary }}>
                                    GHS {parseFloat(item.subtotal).toFixed(2)}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div className="border-t border-zinc-100 px-5 py-3">
                        <div className="flex justify-between text-sm font-bold" style={{ color: primary }}>
                            <span>Total</span>
                            <span>{order.currency} {parseFloat(order.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-center">
                <Link
                    href={`/s/${business.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: accent }}
                >
                    Continue Shopping
                </Link>
            </div>
        </main>
    );
}

export default function CheckoutSuccess({ business, order, pages }: Props) {
    return (
        <ClassicThemeShell business={business} pages={pages}>
            <SuccessContent business={business} order={order} />
        </ClassicThemeShell>
    );
}
