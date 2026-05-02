import { Link } from '@inertiajs/react';
import { Lock, Plus } from 'lucide-react';
import { useTier } from '@/hooks/use-tier';
import { useUpgradeModal } from '@/stores/upgrade-modal-store';

/**
 * The "Add product" call-to-action on the Products index. Lives as its own
 * component so the tier gating + usage indicator stay co-located.
 *
 * Visible-but-grayed pattern: when a business hits its product cap the CTA
 * stays in place, gets disabled, and shows a Pro pill plus an "X / N used"
 * indicator. Clicking the locked button opens the global upgrade modal.
 *
 * Existing products remain editable when downgraded (data preservation
 * rule, ANALYTICS_TIERS.md section 1.4).
 */
type Props = {
    createUrl: string;
    productsCount: number;
};

export function AddProductCta({ createUrl, productsCount }: Props) {
    const { limit } = useTier();
    const showUpgrade = useUpgradeModal((s) => s.show);
    const productLimit = limit('max_products');
    const atCap = productLimit !== null && productsCount >= productLimit;

    return (
        <div className="flex items-center gap-3">
            {productLimit !== null && (
                <div className="hidden text-right sm:block">
                    <p className={`text-sm font-bold ${atCap ? 'text-brand' : 'text-site-fg'}`}>
                        {productsCount} / {productLimit} used
                    </p>
                    {atCap && (
                        <button
                            type="button"
                            onClick={() => showUpgrade({ feature: 'products.unlimited' })}
                            className="text-xs font-semibold text-brand hover:underline"
                        >
                            Upgrade for more →
                        </button>
                    )}
                </div>
            )}

            {atCap ? (
                <button
                    type="button"
                    onClick={() => showUpgrade({ feature: 'products.unlimited' })}
                    title="Upgrade to add more products"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-brand/50 bg-brand/10 px-5 py-2 text-sm font-bold text-brand transition hover:border-brand hover:bg-brand/15"
                >
                    <Lock className="h-4 w-4" />
                    Add product · Pro
                </button>
            ) : (
                <Link
                    href={createUrl}
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-hover"
                >
                    <Plus className="h-4 w-4" />
                    Add product
                </Link>
            )}
        </div>
    );
}
