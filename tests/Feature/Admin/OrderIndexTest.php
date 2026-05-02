<?php

use App\Enums\OrderStatus;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Business;
use App\Models\Buyer;
use App\Models\MarketplacePurchase;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->business = Business::factory()->for($this->user, 'owner')->create();
    actingAs($this->user);
});

test('stats are deferred so the list paints first', function () {
    Order::factory()->for($this->business)->create(['status' => OrderStatus::Paid, 'total' => 240.00]);

    // Inertia v2 deferred props skip the initial response — Inertia fetches them
    // in a follow-up partial reload. The list and filters must still be present.
    $this->get(route('businesses.orders.index', $this->business))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Orders/Index')
            ->has('orders.data', 1)
            ->missing('stats')
        );
});

test('stats partial reload returns the four physical-order tiles', function () {
    Order::factory()->for($this->business)->count(2)->create(['status' => OrderStatus::Paid, 'total' => 100.00]);
    Order::factory()->for($this->business)->create(['status' => OrderStatus::Fulfilled, 'total' => 50.00]);
    Order::factory()->for($this->business)->create(['status' => OrderStatus::Pending, 'total' => 25.00]);
    Order::factory()->for($this->business)->create(['status' => OrderStatus::Cancelled, 'total' => 999.00]);
    Order::factory()->for($this->business)->create(['status' => OrderStatus::Refunded, 'total' => 999.00]);

    $version = app(HandleInertiaRequests::class)->version(request());

    $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (string) $version,
        'X-Inertia-Partial-Component' => 'Admin/Orders/Index',
        'X-Inertia-Partial-Data' => 'stats',
    ])
        ->get(route('businesses.orders.index', $this->business))
        ->assertOk()
        ->assertJsonPath('props.stats.revenue_total', '250') // paid + fulfilled
        ->assertJsonPath('props.stats.paid', 2)
        ->assertJsonPath('props.stats.fulfilled', 1)
        ->assertJsonPath('props.stats.cancelled', 2); // cancelled + refunded combined
});

test('digital stats partial reload returns the four purchase tiles', function () {
    $this->business->update(['business_type' => 'digital']);

    $product = Product::factory()->for($this->business)->create();

    // Unique constraint on (buyer_id, product_id) — each purchase needs its own buyer.
    foreach ([['paid', 100.00], ['paid', 100.00], ['free', 0], ['pending', 50.00]] as [$status, $amount]) {
        MarketplacePurchase::factory()
            ->for(Buyer::factory())
            ->for($product)
            ->create(['status' => $status, 'amount_paid' => $amount]);
    }

    $version = app(HandleInertiaRequests::class)->version(request());

    $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (string) $version,
        'X-Inertia-Partial-Component' => 'Admin/Orders/Index',
        'X-Inertia-Partial-Data' => 'stats',
    ])
        ->get(route('businesses.orders.index', $this->business))
        ->assertOk()
        ->assertJsonPath('props.stats.revenue_total', '200') // only paid contributes
        ->assertJsonPath('props.stats.paid', 2)
        ->assertJsonPath('props.stats.free', 1)
        ->assertJsonPath('props.stats.pending', 1);
});
