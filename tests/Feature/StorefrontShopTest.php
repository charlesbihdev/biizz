<?php

use App\Models\Business;
use App\Models\Product;
use App\Models\User;

beforeEach(function () {
    $owner = User::factory()->create();
    $this->business = Business::factory()->for($owner, 'owner')->active()->create([
        'theme_settings' => ['show_shop_page' => true],
    ]);
    // Products require a category (NOT NULL constraint)
    $this->category = $this->business->categories()->create(['name' => 'General', 'slug' => 'general', 'sort_order' => 0]);
});

test('shop page renders for active business', function () {
    $this->get(route('storefront.shop', $this->business))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Storefront/Shop'));
});

test('shop page includes products, priceRange, and filters props', function () {
    Product::factory()->for($this->business)->count(3)->create([
        'is_active' => true,
        'stock' => 10,
        'category_id' => $this->category->id,
    ]);

    $this->get(route('storefront.shop', $this->business))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Storefront/Shop')
            ->has('products')
            ->has('priceRange')
            ->has('filters')
        );
});

test('shop page filters by category slug', function () {
    $other = $this->business->categories()->create(['name' => 'Other', 'slug' => 'other', 'sort_order' => 1]);

    Product::factory()->for($this->business)->count(2)->create(['is_active' => true, 'stock' => 5, 'category_id' => $this->category->id]);
    Product::factory()->for($this->business)->count(2)->create(['is_active' => true, 'stock' => 5, 'category_id' => $other->id]);

    $this->get(route('storefront.shop', $this->business).'?category='.$this->category->slug)
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Storefront/Shop')
            ->where('filters.category', $this->category->slug)
        );
});

test('shop page returns 404 for inactive business', function () {
    $inactive = Business::factory()->for(User::factory()->create(), 'owner')->create(['is_active' => false]);

    $this->get(route('storefront.shop', $inactive))
        ->assertNotFound();
});

test('shop page returns 404 when show_shop_page is disabled', function () {
    $this->business->update(['theme_settings' => ['show_shop_page' => false]]);

    $this->get(route('storefront.shop', $this->business))
        ->assertNotFound();
});
