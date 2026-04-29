<?php

use App\Models\Business;
use App\Models\User;
use App\Services\BusinessContext;
use Inertia\Testing\AssertableInertia;

afterEach(fn () => BusinessContext::clear());

test('dashboard exposes auth.activeGuard as web', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'web')
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('auth.activeGuard', 'web'));
});

test('marketplace index exposes auth.activeGuard as buyer', function () {
    $this->get(route('marketplace.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('auth.activeGuard', 'buyer'));
});

test('storefront exposes auth.activeGuard as customer', function () {
    $business = Business::factory()->active()->create();

    $this->get(route('storefront.show', ['business' => $business]))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('auth.activeGuard', 'customer'));
});
