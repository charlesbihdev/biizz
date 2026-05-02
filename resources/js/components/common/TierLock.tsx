import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTier } from '@/hooks/use-tier';
import { useUpgradeModal } from '@/stores/upgrade-modal-store';
import type { SubscriptionTier } from '@/types';

/**
 * Gates a piece of UI behind a feature key declared in `config/biizz.php`.
 *
 * - If the active business's tier can access the feature: renders children
 *   normally.
 * - Otherwise: renders the children blurred behind a small "Pro" / "Pro Max"
 *   strip with an upgrade CTA. Clicking the strip opens the global tier
 *   upgrade modal mounted at the layout level.
 *
 * Always gate by feature key, never by tier name. See ANALYTICS_TIERS.md
 * sections 1.1, 1.2, 1.6, 7.4.
 */

const TIER_LABEL: Record<SubscriptionTier, string> = {
    free: 'Free',
    pro: 'Pro',
    pro_max: 'Pro Max',
};

type Props = {
    feature: string;
    /** Optional override for the CTA copy. */
    cta?: string;
    /** Hide the children entirely instead of blurring (rare; default is blur). */
    blur?: boolean;
    children: ReactNode;
};

export function TierLock({ feature, cta, blur = true, children }: Props) {
    const { can, requiredTier } = useTier();
    const showUpgrade = useUpgradeModal((s) => s.show);

    if (can(feature)) {
        return <>{children}</>;
    }

    const required = requiredTier(feature);
    const tierLabel = required ? TIER_LABEL[required] : 'Pro';
    const ctaCopy = cta ?? `Unlock with ${tierLabel}`;

    return (
        <div className="relative">
            <div
                aria-hidden="true"
                className={`pointer-events-none select-none ${blur ? 'opacity-60 blur-[2px]' : 'opacity-50'}`}
            >
                {children}
            </div>

            <div className="absolute inset-0 flex items-center justify-center p-4">
                <button
                    type="button"
                    onClick={() => showUpgrade({ feature })}
                    className="inline-flex max-w-xs items-center gap-2 rounded-full border border-brand/30 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-site-fg shadow-sm backdrop-blur transition hover:border-brand hover:bg-white"
                >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand/15 text-brand">
                        <Lock className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    <span className="font-bold tracking-wide text-brand">
                        {tierLabel}
                    </span>
                    <span className="hidden text-site-muted sm:inline">
                        · {ctaCopy}
                    </span>
                </button>
            </div>
        </div>
    );
}

/**
 * Standalone clickable pill, useful next to disabled controls (toggles,
 * buttons) where the visible-but-grayed pattern fits better than wrapping
 * in TierLock. Opens the global upgrade modal on click.
 * See ANALYTICS_TIERS.md section 1.2.
 */
export function TierPill({ feature, className = '' }: { feature: string; className?: string }) {
    const { requiredTier, can } = useTier();
    const showUpgrade = useUpgradeModal((s) => s.show);

    if (can(feature)) {
        return null;
    }

    const required = requiredTier(feature);
    if (!required) return null;

    return (
        <button
            type="button"
            onClick={() => showUpgrade({ feature })}
            title={`Upgrade to ${TIER_LABEL[required]}`}
            className={`inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand transition hover:bg-brand/20 ${className}`}
        >
            <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
            {TIER_LABEL[required]}
        </button>
    );
}
