import { router, usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import AuthPromptModal from '@/components/marketplace/AuthPromptModal';
import { buy } from '@/routes/marketplace';
import type { Auth, Product } from '@/types';

interface Props {
    product: Product & { business: { slug: string } };
}

function SavingsBadge({ price, compareAtPrice }: { price: string; compareAtPrice: string | null }) {
    if (!compareAtPrice) {
        return null;
    }

    const saved = parseFloat(compareAtPrice) - parseFloat(price);
    const pct   = Math.round((saved / parseFloat(compareAtPrice)) * 100);
    if (pct <= 0) {
        return null;
    }

    return (
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            Save {pct}%
        </span>
    );
}

export default function PurchaseBox({ product }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth?.buyer;
    const [showAuth, setShowAuth] = useState(false);
    const [loading, setLoading] = useState(false);

    const price          = parseFloat(product.price);
    const compareAtPrice = product.compare_at_price ? parseFloat(product.compare_at_price) : null;
    const isFree         = price === 0;
    const buyUrl         = buy({ business: product.business.slug, product: product.slug }).url;

    function handleBuy() {
        if (!user) {
            setShowAuth(true);
            return;
        }

        setLoading(true);
        router.post(buyUrl, {}, {
            onFinish: () => setLoading(false),
        });
    }

    return (
        <>
            <div className="rounded-2xl border border-site-border bg-site-surface p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        {compareAtPrice && (
                            <span className="text-sm text-site-muted line-through">
                                GHS {compareAtPrice.toFixed(2)}
                            </span>
                        )}
                        <span className="text-3xl font-bold text-site-fg">
                            {isFree ? 'Free' : `GHS ${price.toFixed(2)}`}
                        </span>
                    </div>
                    <SavingsBadge price={product.price} compareAtPrice={product.compare_at_price} />
                </div>

                {compareAtPrice && (
                    <p className="mb-4 text-xs text-site-muted">
                        You save GHS {(compareAtPrice - price).toFixed(2)}
                    </p>
                )}

                <button
                    type="button"
                    onClick={handleBuy}
                    disabled={loading}
                    className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                >
                    {loading ? 'Processing...' : isFree ? 'Get for Free' : `Buy Now · GHS ${price.toFixed(2)}`}
                </button>

                {!isFree && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-site-muted">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Secure payment via Paystack
                    </div>
                )}
            </div>

            <AuthPromptModal
                open={showAuth}
                onClose={() => setShowAuth(false)}
                onAuthenticated={() => { setShowAuth(false); handleBuy(); }}
            />
        </>
    );
}
