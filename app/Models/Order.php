<?php

namespace App\Models;

use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Models\Scopes\BusinessScope;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[ScopedBy([BusinessScope::class])]
#[Fillable([
    'business_id',
    'customer_name',
    'customer_email',
    'customer_phone',
    'total',
    'currency',
    'status',
    'payment_ref',
    'payment_provider',
    'source',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'total'  => 'decimal:2',
            'status' => OrderStatus::class,
            'source' => OrderSource::class,
        ];
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    /** @return BelongsTo<Business, $this> */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    /** @param \Illuminate\Database\Eloquent\Builder<Order> $query */
    public function scopePaid($query): void
    {
        $query->where('status', OrderStatus::Paid);
    }

    /** @param \Illuminate\Database\Eloquent\Builder<Order> $query */
    public function scopePending($query): void
    {
        $query->where('status', OrderStatus::Pending);
    }
}
