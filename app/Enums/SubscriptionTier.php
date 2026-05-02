<?php

namespace App\Enums;

enum SubscriptionTier: string
{
    case Free = 'free';
    case Pro = 'pro';
    case ProMax = 'pro_max';

    public function label(): string
    {
        return match ($this) {
            self::Free => 'Free',
            self::Pro => 'Pro',
            self::ProMax => 'Pro Max',
        };
    }

    public function rank(): int
    {
        return match ($this) {
            self::Free => 0,
            self::Pro => 1,
            self::ProMax => 2,
        };
    }

    public function canAccess(self $required): bool
    {
        return $this->rank() >= $required->rank();
    }

    /** @return array<string, mixed> */
    public function limits(): array
    {
        return config("biizz.tiers.{$this->value}.limits", []);
    }

    /** @return array<string, bool> */
    public function flags(): array
    {
        return config("biizz.tiers.{$this->value}.flags", []);
    }
}
