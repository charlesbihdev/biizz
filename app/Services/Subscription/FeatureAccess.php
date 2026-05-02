<?php

namespace App\Services\Subscription;

use App\Enums\SubscriptionTier;
use App\Models\Business;
use InvalidArgumentException;

/**
 * The single place that reads `config('biizz.*')`. Every tier-aware code
 * path in the app goes through these four methods.
 *
 * See ANALYTICS_TIERS.md section 1.1 (config-driven gating) for the contract.
 */
final class FeatureAccess
{
    /**
     * Resolve the minimum tier required to access a feature.
     *
     * Feature keys contain dots ("analytics.compare_periods") so we cannot
     * use Laravel's `config('biizz.features.analytics.compare_periods')` —
     * the helper would treat the dots as nested-array traversal. We pull
     * the whole map once and do a direct lookup instead.
     *
     * @throws InvalidArgumentException when the feature key is not defined in config
     */
    public static function tierFor(string $featureKey): SubscriptionTier
    {
        $entry = self::entry($featureKey);

        return SubscriptionTier::from($entry['min_tier']);
    }

    /**
     * Resolve the audience a feature applies to: `physical`, `digital`, or
     * `all`. Drives audience-aware filtering of bullets in the in-app
     * upgrade modal and sectioning of the public pricing matrix.
     *
     * @throws InvalidArgumentException when the feature key is not defined in config
     */
    public static function audienceFor(string $featureKey): string
    {
        $entry = self::entry($featureKey);

        return $entry['audience'];
    }

    /**
     * Internal: read and validate a single feature entry. Centralised so
     * the config-shape contract lives in one place.
     *
     * @return array{min_tier: string, audience: string}
     *
     * @throws InvalidArgumentException
     */
    private static function entry(string $featureKey): array
    {
        /** @var array<string, mixed> $features */
        $features = config('biizz.features', []);

        if (! array_key_exists($featureKey, $features) || ! is_array($features[$featureKey])) {
            throw new InvalidArgumentException("Unknown feature key: {$featureKey}");
        }

        $entry = $features[$featureKey];

        if (! isset($entry['min_tier']) || ! is_string($entry['min_tier'])) {
            throw new InvalidArgumentException("Feature {$featureKey} is missing min_tier");
        }

        if (! isset($entry['audience']) || ! is_string($entry['audience'])) {
            throw new InvalidArgumentException("Feature {$featureKey} is missing audience");
        }

        return ['min_tier' => $entry['min_tier'], 'audience' => $entry['audience']];
    }

    /**
     * Whether the business may access the feature.
     */
    public static function check(Business $business, string $featureKey): bool
    {
        return $business->subscription_tier->canAccess(self::tierFor($featureKey));
    }

    /**
     * Read a numeric limit for the business's current tier. `null` means
     * unlimited.
     */
    public static function limit(Business $business, string $limitKey): ?int
    {
        /** @var array<string, mixed> $limits */
        $limits = config("biizz.tiers.{$business->subscription_tier->value}.limits", []);

        $value = $limits[$limitKey] ?? null;

        return $value === null ? null : (int) $value;
    }

    /**
     * Read a boolean flag for the business's current tier.
     */
    public static function flag(Business $business, string $flagKey): bool
    {
        /** @var array<string, mixed> $flags */
        $flags = config("biizz.tiers.{$business->subscription_tier->value}.flags", []);

        return ($flags[$flagKey] ?? false) === true;
    }
}
