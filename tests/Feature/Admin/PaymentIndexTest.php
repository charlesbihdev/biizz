<?php

use App\Enums\PaymentStatus;
use App\Models\Business;
use App\Models\Buyer;
use App\Models\MarketplacePayment;
use App\Models\MarketplacePurchase;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->business = Business::factory()->for($this->user, 'owner')->create();
    actingAs($this->user);
});

test('index renders payments scoped to the current business', function () {
    $order = Order::factory()->for($this->business)->create();
    Payment::factory()->for($this->business)->for($order)->success()->count(3)->create();

    // Payment for another business — must not appear.
    $other = Business::factory()->for(User::factory(), 'owner')->create();
    $otherOrder = Order::factory()->for($other)->create();
    Payment::factory()->for($other)->for($otherOrder)->create();

    $this->get(route('businesses.payments.index', $this->business))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Payments/Index')
            ->has('payments.data', 3)
            ->where('isDigital', false)
        );
});

test('index returns 403 for non-owners', function () {
    $other = User::factory()->create();
    actingAs($other);

    $this->get(route('businesses.payments.index', $this->business))->assertForbidden();
});

test('index filters by status', function () {
    $order = Order::factory()->for($this->business)->create();
    Payment::factory()->for($this->business)->for($order)->success()->count(2)->create();
    Payment::factory()->for($this->business)->for($order)->failed()->count(1)->create();

    $this->get(route('businesses.payments.index', [$this->business, 'status' => PaymentStatus::Success->value]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('payments.data', 2));
});

test('index filters by gateway', function () {
    $order = Order::factory()->for($this->business)->create();
    Payment::factory()->for($this->business)->for($order)->paystack()->count(2)->create();
    Payment::factory()->for($this->business)->for($order)->junipay()->count(1)->create();

    $this->get(route('businesses.payments.index', [$this->business, 'gateway' => 'junipay']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('payments.data', 1));
});

test('index searches by reference', function () {
    $order = Order::factory()->for($this->business)->create();
    Payment::factory()->for($this->business)->for($order)->create(['reference' => 'pay_FINDABLE_REF']);
    Payment::factory()->for($this->business)->for($order)->count(2)->create();

    $this->get(route('businesses.payments.index', [$this->business, 'search' => 'FINDABLE']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('payments.data', 1));
});

test('index branches to marketplace payments for digital businesses', function () {
    $this->business->update(['business_type' => 'digital']);

    $product = Product::factory()->for($this->business)->create();
    $purchase = MarketplacePurchase::factory()
        ->for(Buyer::factory())
        ->for($product)
        ->create();
    MarketplacePayment::factory()->for($purchase, 'purchase')->success()->create();

    $this->get(route('businesses.payments.index', $this->business))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Payments/Index')
            ->where('isDigital', true)
            ->has('payments.data', 1)
        );
});

test('stats are not in the initial render so the list paints first', function () {
    Payment::factory()
        ->for($this->business)
        ->for(Order::factory()->for($this->business))
        ->success()
        ->create(['amount' => 240.00]);

    // Inertia v2 deferred props skip the initial response — Inertia fetches them
    // in a follow-up partial reload. The list and filters must still be present.
    $this->get(route('businesses.payments.index', $this->business))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Payments/Index')
            ->has('payments.data', 1)
            ->missing('stats')
        );
});
