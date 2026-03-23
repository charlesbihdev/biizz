<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending   = 'pending';
    case Paid      = 'paid';
    case Fulfilled = 'fulfilled';
    case Cancelled = 'cancelled';
    case Refunded  = 'refunded';

    public function label(): string
    {
        return match($this) {
            self::Pending   => 'Pending',
            self::Paid      => 'Paid',
            self::Fulfilled => 'Fulfilled',
            self::Cancelled => 'Cancelled',
            self::Refunded  => 'Refunded',
        };
    }

    public function isTerminal(): bool
    {
        return match($this) {
            self::Fulfilled, self::Cancelled, self::Refunded => true,
            default => false,
        };
    }
}
