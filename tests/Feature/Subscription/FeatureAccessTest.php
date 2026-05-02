<?php

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Models\User;
use App\Services\Subscription\FeatureAccess;

beforeEach(function () {
    $this->business = Business::factory()->for(User::factory(), 'owner')->create();
});

test('tierFor resolves the configured minimum tier for a feature key', function () {
    expect(FeatureAccess::tierFor('analytics.overview'))->toBe(SubscriptionTier::Free)
        ->and(FeatureAccess::tierFor('analytics.compare_periods'))->toBe(SubscriptionTier::Pro)
        ->and(FeatureAccess::tierFor('analytics.rfm'))->toBe(SubscriptionTier::ProMax)
        ->and(FeatureAccess::tierFor('storefront.no_branding'))->toBe(SubscriptionTier::Pro);
});

test('tierFor throws on unknown feature key', function () {
    FeatureAccess::tierFor('analytics.this_does_not_exist');
})->throws(InvalidArgumentException::class);

test('audienceFor resolves the audience tag for a feature key', function () {
    expect(FeatureAccess::audienceFor('products.unlimited'))->toBe('all')
        ->and(FeatureAccess::audienceFor('storefront.no_branding'))->toBe('physical')
        ->and(FeatureAccess::audienceFor('storage.larger_digital_files'))->toBe('digital')
        ->and(FeatureAccess::audienceFor('storage.more_digital_storage'))->toBe('digital')
        ->and(FeatureAccess::audienceFor('analytics.stock_velocity'))->toBe('physical')
        ->and(FeatureAccess::audienceFor('analytics.overview'))->toBe('all');
});

test('audienceFor throws on unknown feature key', function () {
    FeatureAccess::audienceFor('analytics.does_not_exist');
})->throws(InvalidArgumentException::class);

test('check returns true only when the business tier meets or exceeds the requirement', function (
    string $tier,
    string $feature,
    bool $expected,
) {
    $this->business->setTier(SubscriptionTier::from($tier));

    expect(FeatureAccess::check($this->business->fresh(), $feature))->toBe($expected);
})->with([
    'free user gets free feature' => ['free', 'analytics.overview', true],
    'free user blocked from pro feature' => ['free', 'analytics.compare_periods', false],
    'free user blocked from pro_max feature' => ['free', 'analytics.rfm', false],
    'pro user gets free feature' => ['pro', 'analytics.overview', true],
    'pro user gets pro feature' => ['pro', 'analytics.compare_periods', true],
    'pro user blocked from pro_max feature' => ['pro', 'analytics.rfm', false],
    'pro_max user gets everything' => ['pro_max', 'analytics.rfm', true],
    'pro_max user gets pro feature' => ['pro_max', 'analytics.compare_periods', true],
]);

test('limit reads the per-tier numeric limit from config', function () {
    $this->business->setTier(SubscriptionTier::Free);
    expect(FeatureAccess::limit($this->business->fresh(), 'max_products'))
        ->toBe(config('biizz.tiers.free.limits.max_products'))
        ->and(FeatureAccess::limit($this->business->fresh(), 'max_product_images'))
        ->toBe(config('biizz.tiers.free.limits.max_product_images'));

    $this->business->setTier(SubscriptionTier::Pro);
    expect(FeatureAccess::limit($this->business->fresh(), 'max_products'))
        ->toBe(config('biizz.tiers.pro.limits.max_products'))
        ->and(FeatureAccess::limit($this->business->fresh(), 'max_product_images'))
        ->toBe(config('biizz.tiers.pro.limits.max_product_images'));

    $this->business->setTier(SubscriptionTier::ProMax);
    expect(FeatureAccess::limit($this->business->fresh(), 'max_product_images'))
        ->toBe(config('biizz.tiers.pro_max.limits.max_product_images'));
});

test('flag reads the per-tier boolean from config', function () {
    $this->business->setTier(SubscriptionTier::Free);
    expect(FeatureAccess::flag($this->business->fresh(), 'storefront_branding_forced'))->toBeTrue();

    $this->business->setTier(SubscriptionTier::Pro);
    expect(FeatureAccess::flag($this->business->fresh(), 'storefront_branding_forced'))->toBeFalse();
});

test('setTier records an audit row when the tier changes', function () {
    $changer = User::factory()->create();

    expect($this->business->subscription_tier)->toBe(SubscriptionTier::Free)
        ->and($this->business->subscriptionChanges()->count())->toBe(0);

    $this->business->setTier(SubscriptionTier::Pro, $changer, 'Beta access');

    expect($this->business->fresh()->subscription_tier)->toBe(SubscriptionTier::Pro);

    $audit = $this->business->subscriptionChanges()->first();
    expect($audit->from_tier)->toBe('free')
        ->and($audit->to_tier)->toBe('pro')
        ->and($audit->changed_by)->toBe($changer->id)
        ->and($audit->reason)->toBe('Beta access');
});

test('setTier is a no-op when called with the current tier', function () {
    $this->business->setTier(SubscriptionTier::Free);

    expect($this->business->subscriptionChanges()->count())->toBe(0);
});
