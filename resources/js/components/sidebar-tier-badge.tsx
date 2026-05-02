import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTier } from '@/hooks/use-tier';
import { show as billingShow } from '@/routes/businesses/billing';
import { useUpgradeModal } from '@/stores/upgrade-modal-store';
import type { Business } from '@/types';

/**
 * Compact subscription tier indicator pinned in the sidebar footer above the
 * user menu. Always-visible ambient pressure for Free businesses; quick
 * access to billing for Pro / Pro Max.
 *
 * - Free: subtle Pro upsell button → opens the upgrade modal.
 * - Pro / Pro Max: gradient pill linking to the billing page.
 *
 * Hidden in icon-only sidebar mode (the user avatar handles that footprint).
 * See ANALYTICS_TIERS.md sections 1.2, 1.7.
 */

export function SidebarTierBadge() {
    const { business } = usePage().props as { business: Business | null };
    const { current, label } = useTier();
    const showUpgrade = useUpgradeModal((s) => s.show);

    if (!current || !business) return null;

    const isFree = current === 'free';

    return (
        <div className="px-2 pb-1.5 group-data-[collapsible=icon]:hidden">
            {isFree ? (
                <button
                    type="button"
                    onClick={() => showUpgrade()}
                    className="group flex w-full items-center justify-between gap-2 rounded-lg border border-brand/20 bg-brand/5 px-3 py-2 text-left transition hover:border-brand/40 hover:bg-brand/10"
                >
                    <span className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-site-muted">
                            Plan
                        </span>
                        <span className="text-sm font-bold text-site-fg">
                            {label}
                        </span>
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-brand">
                        Upgrade
                        <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                    </span>
                </button>
            ) : (
                <Link
                    href={billingShow({ business: business.slug }).url}
                    className="group flex w-full items-center justify-between gap-2 rounded-lg bg-linear-to-br from-brand to-brand/80 px-3 py-2 text-left text-white transition hover:shadow-md"
                >
                    <span className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                            Plan
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-bold">
                            <Sparkles className="h-3.5 w-3.5" />
                            {label}
                        </span>
                    </span>
                    <span className="text-[11px] font-semibold text-white/85 group-hover:text-white">
                        Manage →
                    </span>
                </Link>
            )}
        </div>
    );
}
