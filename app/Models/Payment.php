<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use App\Models\Scopes\BusinessScope;
use Database\Factories\PaymentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[ScopedBy([BusinessScope::class])]
#[Fillable([
    'business_id',
    'order_id',
    'customer_id',
    'gateway',
    'reference',
    'transaction_id',
    'amount',
    'currency',
    'status',
    'paid_at',
    'metadata',
])]
class Payment extends Model
{
    /** @use HasFactory<PaymentFactory> */
    use HasFactory;

    /**
     * Fields hidden from array/JSON serialization (Inertia, API responses).
     * Internal Eloquent access via $payment->metadata still works for services.
     */
    protected $hidden = [
        'business_id',
        'order_id',
        'customer_id',
        'metadata',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'status' => PaymentStatus::class,
            'paid_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    /** @return BelongsTo<Business, $this> */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return BelongsTo<Customer, $this> */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function isSuccessful(): bool
    {
        return $this->status === PaymentStatus::Success;
    }

    public function isPending(): bool
    {
        return $this->status === PaymentStatus::Pending;
    }
}
