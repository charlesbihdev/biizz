<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use App\Models\Scopes\BusinessScope;
use Database\Factories\MarketplacePaymentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[ScopedBy([BusinessScope::class])]
#[Fillable([
    'business_id',
    'marketplace_purchase_id',
    'gateway',
    'reference',
    'transaction_id',
    'amount',
    'currency',
    'status',
    'metadata',
    'paid_at',
])]
class MarketplacePayment extends Model
{
    /** @use HasFactory<MarketplacePaymentFactory> */
    use HasFactory;

    /**
     * Fields hidden from array/JSON serialization (Inertia, API responses).
     * Internal Eloquent access via $payment->metadata still works for services.
     */
    protected $hidden = [
        'business_id',
        'marketplace_purchase_id',
        'metadata',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'status' => PaymentStatus::class,
            'metadata' => 'array',
            'paid_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function isSuccessful(): bool
    {
        return $this->status === PaymentStatus::Success;
    }

    /** @return BelongsTo<Business, $this> */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /** @return BelongsTo<MarketplacePurchase, $this> */
    public function purchase(): BelongsTo
    {
        return $this->belongsTo(MarketplacePurchase::class, 'marketplace_purchase_id');
    }
}
