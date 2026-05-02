<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;

test('pricing page is publicly accessible', function () {
    $this->get(route('pricing'))
        ->assertOk()
        ->assertInertia(
            fn (AssertableInertia $page) => $page
                ->component('Pricing/Index')
                ->where('currency', config('biizz.currency'))
                ->has('tiers.free')
                ->has('tiers.pro')
                ->has('tiers.pro_max')
                ->where('tiers.free.label', 'Free')
                ->where('tiers.pro.label', 'Pro')
                ->where('tiers.pro_max.label', 'Pro Max')
                // Marketplace fee is part of the tier metadata and drives the
                // dynamic Marketplace fee row in the comparison matrix. Read
                // from config so re-pricing in `config/biizz.php` does not
                // require updating this test.
                ->where('tiers.free.marketplace_fee_percent', config('biizz.tiers.free.marketplace_fee_percent'))
                ->where('tiers.pro.marketplace_fee_percent', config('biizz.tiers.pro.marketplace_fee_percent'))
                ->where('tiers.pro_max.marketplace_fee_percent', config('biizz.tiers.pro_max.marketplace_fee_percent'))
        );
});

test('pricing page is also accessible to authenticated users', function () {
    actingAs(User::factory()->create());

    $this->get(route('pricing'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('Pricing/Index'));
});
