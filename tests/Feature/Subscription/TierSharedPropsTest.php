<?php

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->business = Business::factory()->for($this->user, 'owner')->create();
    actingAs($this->user);
});

test('tier shared prop is null on routes without business context', function () {
    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('tier', null));
});

test('tier shared prop reflects the active business on business-scoped routes', function () {
    $this->get(route('businesses.show', $this->business))
        ->assertOk()
        ->assertInertia(
            fn (AssertableInertia $page) => $page
                // Top-level scalars use direct dotted paths.
                ->where('tier.current', 'free')
                ->where('tier.rank', 0)
                ->where('tier.label', 'Free')
                // `limits` and `flags` keys contain no dots, safe to traverse.
                ->where('tier.limits.max_products', 3)
                ->where('tier.limits.max_product_images', 1)
                ->where('tier.flags.storefront_branding_forced', true)
                // Subscription billing fields land for Phase 3 — the
                // billing page reads them and the upgrade modal copies
                // change shape based on `cancel_at_period_end`.
                ->where('tier.subscription_status', 'inactive')
                ->where('tier.current_period_end', null)
                ->where('tier.cancel_at_period_end', false)
                // auto_renew is true only when Paystack drives renewal —
                // i.e. an active card subscription. Free / inactive / manual
                // / past_due users all see false.
                ->where('tier.auto_renew', false)
                // `tiers` carries every tier's snapshot for upsell copy and
                // is keyed by tier value (free / pro / pro_max).
                ->where('tier.tiers.free.label', 'Free')
                ->where('tier.tiers.free.price', 0)
                ->where('tier.tiers.pro.label', 'Pro')
                ->where('tier.tiers.pro.limits.max_product_images', 8)
                ->where('tier.tiers.pro_max.label', 'Pro Max')
                ->where('tier.tiers.pro_max.limits.max_product_images', 20)
                // Per-tier marketplace fee is exposed for /pricing and modal copy.
                ->where('tier.tiers.free.marketplace_fee_percent', config('biizz.tiers.free.marketplace_fee_percent'))
                ->where('tier.tiers.pro.marketplace_fee_percent', config('biizz.tiers.pro.marketplace_fee_percent'))
                ->where('tier.tiers.pro_max.marketplace_fee_percent', config('biizz.tiers.pro_max.marketplace_fee_percent'))
                // Currency is shared so the modal can format prices consistently.
                ->where('tier.currency', config('biizz.currency'))
                // `features` keys contain dots ("analytics.compare_periods")
                // which Inertia's dotted-path traversal would mis-parse. Each
                // entry now carries `min_tier` and `audience`. Assert via a
                // callback against the normalised map.
                ->where('tier.features', function ($features) {
                    $map = collect($features)->all();

                    expect($map['products.unlimited'])->toMatchArray([
                        'min_tier' => 'pro',
                        'audience' => 'all',
                    ]);
                    expect($map['storefront.no_branding'])->toMatchArray([
                        'min_tier' => 'pro',
                        'audience' => 'physical',
                    ]);
                    expect($map['storage.larger_digital_files']['audience'])->toBe('digital');
                    expect($map['storage.more_digital_storage']['audience'])->toBe('digital');
                    expect($map['analytics.overview'])->toMatchArray([
                        'min_tier' => 'free',
                        'audience' => 'all',
                    ]);

                    return true;
                })
        );
});

test('auto_renew is true when the business has an active Paystack subscription', function () {
    $this->business->update([
        'subscription_id' => 'SUB_live',
        'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
    ]);

    $this->get(route('businesses.show', $this->business))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('tier.auto_renew', true));
});

test('auto_renew is false for past_due even with a subscription_id present', function () {
    $this->business->update([
        'subscription_id' => 'SUB_live',
        'subscription_status' => Business::SUBSCRIPTION_STATUS_PAST_DUE,
    ]);

    $this->get(route('businesses.show', $this->business))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('tier.auto_renew', false));
});

test('tier shared prop updates when the business is upgraded', function () {
    $this->business->setTier(SubscriptionTier::ProMax);

    $this->get(route('businesses.show', $this->business))
        ->assertOk()
        ->assertInertia(
            fn (AssertableInertia $page) => $page
                ->where('tier.current', 'pro_max')
                ->where('tier.rank', 2)
                ->where('tier.label', 'Pro Max')
                ->where('tier.limits.max_products', config('biizz.tiers.pro_max.limits.max_products'))
                ->where('tier.limits.max_product_images', config('biizz.tiers.pro_max.limits.max_product_images'))
                ->where('tier.flags.storefront_branding_forced', false)
        );
});
