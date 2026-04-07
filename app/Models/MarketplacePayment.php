<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
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
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'metadata' => 'array',
            'paid_at' => 'datetime',
        ];
    }

    public function isSuccessful(): bool
    {
        return $this->status === 'success';
    }

    /** @return BelongsTo<MarketplacePurchase, $this> */
    public function purchase(): BelongsTo
    {
        return $this->belongsTo(MarketplacePurchase::class, 'marketplace_purchase_id');
    }
}
