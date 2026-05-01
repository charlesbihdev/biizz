<?php

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

test('show renders the payment with its order and customer', function () {
    $order = Order::factory()->for($this->business)->create();
    $payment = Payment::factory()->for($this->business)->for($order)->success()->create();

    $this->get(route('businesses.payments.show', [$this->business, $payment]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Payments/Show')
            ->where('payment.reference', $payment->reference)
            ->has('payment.order')
        );
});

test('show does not leak internal fields to the frontend', function () {
    $order = Order::factory()->for($this->business)->create();
    $payment = Payment::factory()->for($this->business)->for($order)->success()->create([
        'metadata' => ['raw_provider_response' => ['secret' => 'value']],
    ]);

    $this->get(route('businesses.payments.show', [$this->business, $payment]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->missing('payment.metadata')
            ->missing('payment.business_id')
            ->missing('payment.order_id')
            ->missing('payment.customer_id')
            ->missing('payment.updated_at')
        );
});

test('show returns 403 for non-owners', function () {
    $order = Order::factory()->for($this->business)->create();
    $payment = Payment::factory()->for($this->business)->for($order)->create();

    $other = User::factory()->create();
    actingAs($other);

    $this->get(route('businesses.payments.show', [$this->business, $payment]))->assertForbidden();
});

test('show returns 404 for a payment from another business', function () {
    $other = Business::factory()->for(User::factory(), 'owner')->create();
    $otherOrder = Order::factory()->for($other)->create();
    $otherPayment = Payment::factory()->for($other)->for($otherOrder)->create();

    // Visiting our own business URL with another business's reference must 404.
    $this->get(route('businesses.payments.show', [$this->business, $otherPayment]))->assertNotFound();
});

test('marketplace show renders for digital purchases', function () {
    $product = Product::factory()->for($this->business)->create();
    $purchase = MarketplacePurchase::factory()
        ->for(Buyer::factory())
        ->for($product)
        ->create();
    $payment = MarketplacePayment::factory()->for($purchase, 'purchase')->success()->create();

    $this->get(route('businesses.payments.marketplace.show', [$this->business, $payment]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Payments/MarketplaceShow')
            ->where('payment.reference', $payment->reference)
            ->has('payment.purchase.buyer')
            ->has('payment.purchase.product')
            ->where('payment.purchase.product.slug', $product->slug)
            ->missing('payment.purchase.product.business_id')
        );
});

test('marketplace show does not leak internal fields to the frontend', function () {
    $product = Product::factory()->for($this->business)->create();
    $purchase = MarketplacePurchase::factory()
        ->for(Buyer::factory())
        ->for($product)
        ->create();
    $payment = MarketplacePayment::factory()->for($purchase, 'purchase')->success()->create([
        'metadata' => ['raw_provider_response' => ['secret' => 'value']],
    ]);

    $this->get(route('businesses.payments.marketplace.show', [$this->business, $payment]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->missing('payment.metadata')
            ->missing('payment.marketplace_purchase_id')
            ->missing('payment.updated_at')
        );
});

test('marketplace show 404s for a payment from another business', function () {
    $other = Business::factory()->for(User::factory(), 'owner')->create();
    $otherProduct = Product::factory()->for($other)->create();
    $otherPurchase = MarketplacePurchase::factory()
        ->for(Buyer::factory())
        ->for($otherProduct)
        ->create();
    $otherPayment = MarketplacePayment::factory()->for($otherPurchase, 'purchase')->create();

    $this->get(route('businesses.payments.marketplace.show', [$this->business, $otherPayment]))->assertNotFound();
});
