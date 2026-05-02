import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import type { FeatureAudience, SubscriptionTier, TierMeta, TierShared } from '@/types';

/**
 * Read-only access to the tier snapshot shared on every business-scoped
 * page. Drives <TierLock> and any inline gated UI.
 *
 * Returns `null` for routes that have no business in scope (auth pages,
 * marketing pages). Components that gate behaviour should treat `null` as
 * "no access" for safety.
 *
 * See ANALYTICS_TIERS.md sections 1.1 and 1.3 for the contract.
 */

export interface UseTierReturn {
    tier: TierShared | null;
    current: SubscriptionTier | null;
    label: string | null;
    /**
     * Whether the active business may use the named feature.
     * Unknown feature keys log a warning and return false.
     */
    can: (featureKey: string) => boolean;
    /**
     * Numeric limit for the active business's tier. `null` means unlimited.
     * Returns `null` if no business is in scope.
     */
    limit: (limitKey: string) => number | null;
    /**
     * Boolean flag for the active business's tier. Returns `false` if no
     * business is in scope.
     */
    flag: (flagKey: string) => boolean;
    /**
     * Resolve the minimum tier required for a feature key. Useful for
     * rendering "Pro" / "Pro Max" pills next to gated controls.
     * Returns `null` for unknown keys.
     */
    requiredTier: (featureKey: string) => SubscriptionTier | null;
    /**
     * Resolve the audience a feature applies to. Drives audience-aware
     * filtering of bullets and pricing matrix rows. Returns `null` for
     * unknown keys.
     */
    audienceFor: (featureKey: string) => FeatureAudience | null;
    /**
     * Resolve the limit value on a different tier. Drives upsell copy:
     * `tierLimit('pro', 'max_product_images')` → 8.
     */
    tierLimit: (tier: SubscriptionTier, limitKey: string) => number | null;
    /**
     * Look up a tier's full metadata (label, limits, flags). Used by the
     * upgrade modal to render comparison tables.
     */
    tierMeta: (tier: SubscriptionTier) => TierMeta | null;
    /**
     * The tier directly above `current` (Free → Pro, Pro → Pro Max,
     * Pro Max → null). Drives default upsell copy.
     */
    nextTier: () => SubscriptionTier | null;
}

const RANK: Record<SubscriptionTier, number> = {
    free: 0,
    pro: 1,
    pro_max: 2,
};

export function useTier(): UseTierReturn {
    const { tier } = usePage().props;

    return useMemo<UseTierReturn>(() => {
        const can = (featureKey: string): boolean => {
            if (!tier) return false;

            const definition = tier.features[featureKey];
            if (!definition) {
                if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
                    console.warn(`[useTier] Unknown feature key: ${featureKey}`);
                }
                return false;
            }

            return RANK[tier.current] >= RANK[definition.min_tier];
        };

        const limit = (limitKey: string): number | null => {
            if (!tier) return null;
            const value = tier.limits[limitKey];
            return value ?? null;
        };

        const flag = (flagKey: string): boolean => {
            if (!tier) return false;
            return tier.flags[flagKey] === true;
        };

        const requiredTier = (featureKey: string): SubscriptionTier | null => {
            return tier?.features[featureKey]?.min_tier ?? null;
        };

        const audienceFor = (featureKey: string): FeatureAudience | null => {
            return tier?.features[featureKey]?.audience ?? null;
        };

        const tierLimit = (target: SubscriptionTier, limitKey: string): number | null => {
            return tier?.tiers[target]?.limits[limitKey] ?? null;
        };

        const tierMeta = (target: SubscriptionTier): TierMeta | null => {
            return tier?.tiers[target] ?? null;
        };

        const nextTier = (): SubscriptionTier | null => {
            if (!tier) return null;
            const order: SubscriptionTier[] = ['free', 'pro', 'pro_max'];
            const idx = order.indexOf(tier.current);
            return order[idx + 1] ?? null;
        };

        return {
            tier,
            current: tier?.current ?? null,
            label: tier?.label ?? null,
            can,
            limit,
            flag,
            requiredTier,
            audienceFor,
            tierLimit,
            tierMeta,
            nextTier,
        };
    }, [tier]);
}
