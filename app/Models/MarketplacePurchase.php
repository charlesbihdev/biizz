<?php

namespace App\Models;

use App\Models\Scopes\BusinessScope;
use Database\Factories\MarketplacePurchaseFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[ScopedBy([BusinessScope::class])]
#[Fillable(['business_id', 'buyer_id', 'product_id', 'amount_paid', 'payment_ref', 'status', 'paid_at'])]
class MarketplacePurchase extends Model
{
    /** @use HasFactory<MarketplacePurchaseFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Business, $this> */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /** @return BelongsTo<Buyer, $this> */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Buyer::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withoutGlobalScopes();
    }

    /** @return HasOne<MarketplacePayment, $this> */
    public function payment(): HasOne
    {
        return $this->hasOne(MarketplacePayment::class);
    }
}
