<?php

namespace App\Models;

use Database\Factories\BusinessFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * The primary tenant silo. Every Product, Order, and data entity belongs to a Business.
 *
 * NOTE: paystack_secret and junipay_secret are intentionally excluded from $fillable.
 * They must only be written via PaymentService::storeKey() to guarantee encryption.
 */
#[Fillable([
    'name', 'slug', 'owner_id', 'is_active',
    'description', 'contact_email', 'phone', 'address', 'website', 'social_links',
    'theme_id', 'theme_settings', 'meta_pixel_id', 'ai_enabled',
])]
class Business extends Model
{
    /** @use HasFactory<BusinessFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::creating(function (Business $business): void {
            if (empty($business->slug)) {
                $business->slug = Str::slug($business->name);
            }
        });
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'theme_settings' => 'array',
            'social_links' => 'array',
            'ai_enabled' => 'boolean',
        ];
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    /** @return BelongsTo<User, $this> */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /** @return HasMany<Product, $this> */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /** @return HasMany<Category, $this> */
    public function categories(): HasMany
    {
        return $this->hasMany(Category::class)->orderBy('sort_order');
    }

    /** @return HasMany<Order, $this> */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /** @return BelongsToMany<User, $this> */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'business_users')
            ->using(BusinessUser::class)
            ->withPivot('role')
            ->withTimestamps('created_at', 'created_at');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function hasPaystackConfigured(): bool
    {
        return ! empty($this->paystack_secret);
    }

    public function hasJunipayConfigured(): bool
    {
        return ! empty($this->junipay_secret);
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->owner_id === $user->id;
    }
}
