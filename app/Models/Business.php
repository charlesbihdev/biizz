<?php

namespace App\Models;

use App\Enums\SubscriptionTier;
use App\Support\DefaultPages;
use Database\Factories\BusinessFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * The primary tenant silo. Every Product, Order, and data entity belongs to a Business.
 *
 * NOTE: paystack_secret and junipay_secret are intentionally excluded from $fillable.
 * They must only be written via PaymentService::storeKey() to guarantee encryption.
 */
#[Fillable([
    'name',
    'slug',
    'owner_id',
    'is_active',
    'logo_url',
    'favicon_url',
    'tagline',
    'business_type',
    'business_category',
    'description',
    'contact_email',
    'phone',
    'address',
    'website',
    'social_links',
    'theme_id',
    'theme_settings',
    'meta_pixel_id',
    'ai_enabled',
    'seo_title',
    'seo_description',
    'seo_image',
    'show_branding',
    'default_payment_provider',
    'customer_login_mode',
    'subscription_tier',
    'trial_ends_at',
    'subscription_gateway',
    'subscription_customer_id',
    'subscription_id',
    'paystack_email_token',
    'subscription_status',
    'current_period_end',
])]
class Business extends Model
{
    /** @use HasFactory<BusinessFactory> */
    use HasFactory;

    protected $hidden = [
        'paystack_secret',
        'junipay_secret',
        'junipay_client_id',
        'junipay_token_link',
    ];

    protected static function booted(): void
    {
        static::creating(function (Business $business): void {
            if (empty($business->slug)) {
                $business->slug = Str::slug($business->name);
            }
        });

        static::created(function (Business $business): void {
            if ($business->business_type === 'digital') {
                return;
            }

            foreach (DefaultPages::stubs() as $stub) {
                $business->pages()->create($stub)->forceFill(['is_system' => true])->save();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'show_branding' => 'boolean',
            'theme_settings' => 'array',
            'social_links' => 'array',
            'ai_enabled' => 'boolean',
            'subscription_tier' => SubscriptionTier::class,
            'trial_ends_at' => 'datetime',
            'current_period_end' => 'datetime',
        ];
    }

    public const SUBSCRIPTION_STATUS_INACTIVE = 'inactive';

    public const SUBSCRIPTION_STATUS_ACTIVE = 'active';

    public const SUBSCRIPTION_STATUS_PAST_DUE = 'past_due';

    public const SUBSCRIPTION_STATUS_CANCELED = 'canceled';

    public const SUBSCRIPTION_STATUS_CANCEL_AT_PERIOD_END = 'cancel_at_period_end';

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

    /** @return HasMany<Page, $this> */
    public function pages(): HasMany
    {
        return $this->hasMany(Page::class)->orderBy('sort_order');
    }

    /** @return HasMany<Order, $this> */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /** @return HasMany<Customer, $this> */
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    /** @return HasMany<Payment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /** @return BelongsToMany<User, $this> */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'business_users')
            ->using(BusinessUser::class)
            ->withPivot('role')
            ->withTimestamps();
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
        return ! empty($this->junipay_secret)
            && ! empty($this->junipay_client_id)
            && ! empty($this->junipay_token_link);
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->owner_id === $user->id;
    }

    /**
     * Switch the subscription tier and record the change in the audit log.
     * Wrap both writes in a transaction so the trail is always consistent.
     */
    public function setTier(SubscriptionTier $tier, ?User $by = null, ?string $reason = null): void
    {
        DB::transaction(function () use ($tier, $by, $reason): void {
            $from = $this->subscription_tier;

            if ($from === $tier) {
                return;
            }

            $this->update(['subscription_tier' => $tier]);

            $this->subscriptionChanges()->create([
                'from_tier' => $from->value,
                'to_tier' => $tier->value,
                'changed_by' => $by?->id,
                'reason' => $reason,
            ]);
        });
    }

    /** @return HasMany<SubscriptionChange, $this> */
    public function subscriptionChanges(): HasMany
    {
        return $this->hasMany(SubscriptionChange::class);
    }

    /** @return HasMany<SubscriptionInvoice, $this> */
    public function subscriptionInvoices(): HasMany
    {
        return $this->hasMany(SubscriptionInvoice::class);
    }

    public function hasActiveSubscription(): bool
    {
        return in_array($this->subscription_status, [
            self::SUBSCRIPTION_STATUS_ACTIVE,
            self::SUBSCRIPTION_STATUS_CANCEL_AT_PERIOD_END,
        ], true);
    }

    public function isCancelAtPeriodEnd(): bool
    {
        return $this->subscription_status === self::SUBSCRIPTION_STATUS_CANCEL_AT_PERIOD_END;
    }
}
