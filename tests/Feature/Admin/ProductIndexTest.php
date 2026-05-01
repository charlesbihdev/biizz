<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Business;
use App\Models\Product;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->business = Business::factory()->for($this->user, 'owner')->create();
    actingAs($this->user);
});

test('stats are deferred so the list paints first', function () {
    Product::factory()->for($this->business)->create();

    $this->get(route('businesses.products.index', $this->business))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Products/Index')
            ->has('products.data', 1)
            ->missing('stats')
        );
});

test('stats partial reload returns the physical-product stat counts', function () {
    Product::factory()->for($this->business)->count(2)->create(['is_active' => true, 'stock' => 10]);
    Product::factory()->for($this->business)->create(['is_active' => false, 'stock' => 5]);
    Product::factory()->for($this->business)->create(['is_active' => true, 'stock' => 0]);
    Product::factory()->for($this->business)->create(['is_active' => true, 'stock' => 3]);
    Product::factory()->for($this->business)->create(['is_active' => true, 'stock' => -2]);

    $version = app(HandleInertiaRequests::class)->version(request());

    $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (string) $version,
        'X-Inertia-Partial-Component' => 'Admin/Products/Index',
        'X-Inertia-Partial-Data' => 'stats',
    ])
        ->get(route('businesses.products.index', $this->business))
        ->assertOk()
        ->assertJsonPath('props.stats.active', 5) // 2 in-stock + 1 out-of-stock + 1 low-stock + 1 oversold
        ->assertJsonPath('props.stats.hidden', 1)
        ->assertJsonPath('props.stats.out_of_stock', 1) // exact zero, oversold not counted here
        ->assertJsonPath('props.stats.low_stock', 1)
        ->assertJsonPath('props.stats.oversold', 1);
});

test('stats partial reload returns the four digital-product tiles', function () {
    $this->business->update(['business_type' => 'digital']);

    Product::factory()->for($this->business)->count(2)->create(['is_active' => true, 'price' => 25.00]);
    Product::factory()->for($this->business)->create(['is_active' => true, 'price' => 0]);
    Product::factory()->for($this->business)->create(['is_active' => false, 'price' => 99.00]);

    $version = app(HandleInertiaRequests::class)->version(request());

    $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (string) $version,
        'X-Inertia-Partial-Component' => 'Admin/Products/Index',
        'X-Inertia-Partial-Data' => 'stats',
    ])
        ->get(route('businesses.products.index', $this->business))
        ->assertOk()
        ->assertJsonPath('props.stats.active', 3)
        ->assertJsonPath('props.stats.hidden', 1)
        ->assertJsonPath('props.stats.free', 1)
        ->assertJsonPath('props.stats.paid', 2);
});
