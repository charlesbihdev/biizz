<?php

namespace App\Services\Subscription;

use App\Enums\SubscriptionTier;
use InvalidArgumentException;

/**
 * Single source of truth for which tiers are *billable* (paid) and what
 * Paystack plan code each one maps to. Keeps controllers and services
 * out of `config('biizz.tiers.*')` for billing concerns.
 */
final class PlanCatalog
{
    /**
     * @return array<int, SubscriptionTier>
     */
    public static function paid(): array
    {
        return [SubscriptionTier::Pro, SubscriptionTier::ProMax];
    }

    public static function isBillable(SubscriptionTier $tier): bool
    {
        return in_array($tier, self::paid(), true);
    }

    /**
     * Throw when the caller tries to charge for a non-billable tier (Free).
     *
     * @throws InvalidArgumentException
     */
    public static function assertBillable(SubscriptionTier $tier): void
    {
        if (! self::isBillable($tier)) {
            throw new InvalidArgumentException("Tier {$tier->value} is not billable.");
        }
    }

    public static function priceFor(SubscriptionTier $tier): int
    {
        return (int) config("biizz.tiers.{$tier->value}.price", 0);
    }

    public static function paystackPlanCodeFor(SubscriptionTier $tier): ?string
    {
        $code = config("biizz.tiers.{$tier->value}.paystack_plan_code");

        return is_string($code) && $code !== '' ? $code : null;
    }

    public static function currency(): string
    {
        return (string) config('biizz.currency', 'GHS');
    }
}
