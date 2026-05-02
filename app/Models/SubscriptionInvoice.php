<?php

namespace App\Models;

use App\Enums\SubscriptionTier;
use Database\Factories\SubscriptionInvoiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'business_id',
    'tier',
    'gateway',
    'reference',
    'provider_transaction_id',
    'gateway_invoice_id',
    'amount',
    'currency',
    'status',
    'period_start',
    'period_end',
    'paid_at',
    'metadata',
])]
class SubscriptionInvoice extends Model
{
    /** @use HasFactory<SubscriptionInvoiceFactory> */
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_PAID = 'paid';

    public const STATUS_FAILED = 'failed';

    public const STATUS_REFUNDED = 'refunded';

    protected function casts(): array
    {
        return [
            'tier' => SubscriptionTier::class,
            'amount' => 'decimal:2',
            'metadata' => 'array',
            'period_start' => 'datetime',
            'period_end' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Business, $this> */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }
}
