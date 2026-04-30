<?php

use App\Models\Business;
use App\Models\Product;
use App\Models\User;

beforeEach(function (): void {
    $owner = User::factory()->create();
    $this->business = Business::factory()->for($owner, 'owner')->active()->create([
        'business_type' => 'digital',
    ]);
    $this->category = $this->business->categories()->create([
        'name' => 'General',
        'slug' => 'general',
        'sort_order' => 0,
    ]);
});

test('marketplace index returns only products tagged with the requested tag', function () {
    Product::factory()->for($this->business)->create([
        'category_id' => $this->category->id,
        'name' => 'Finance Playbook',
        'tags' => ['finance', 'Ghana'],
        'is_active' => true,
    ]);
    Product::factory()->for($this->business)->create([
        'category_id' => $this->category->id,
        'name' => 'Cookbook',
        'tags' => ['food'],
        'is_active' => true,
    ]);

    $this->get(route('marketplace.index', ['tag' => 'finance']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Marketplace/Index')
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Finance Playbook')
            ->where('activeFilters.tag', 'finance')
        );
});

test('tag filter returns no results when no product carries the tag', function () {
    Product::factory()->for($this->business)->create([
        'category_id' => $this->category->id,
        'tags' => ['finance'],
        'is_active' => true,
    ]);

    $this->get(route('marketplace.index', ['tag' => 'unicorns']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('products.data', 0));
});

test('tag and category filters compose', function () {
    Product::factory()->for($this->business)->create([
        'category_id' => $this->category->id,
        'name' => 'Match',
        'digital_category' => 'ebooks',
        'tags' => ['finance'],
        'is_active' => true,
    ]);
    Product::factory()->for($this->business)->create([
        'category_id' => $this->category->id,
        'name' => 'Wrong category',
        'digital_category' => 'courses',
        'tags' => ['finance'],
        'is_active' => true,
    ]);
    Product::factory()->for($this->business)->create([
        'category_id' => $this->category->id,
        'name' => 'Wrong tag',
        'digital_category' => 'ebooks',
        'tags' => ['food'],
        'is_active' => true,
    ]);

    $this->get(route('marketplace.index', ['tag' => 'finance', 'category' => 'ebooks']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Match')
        );
});
