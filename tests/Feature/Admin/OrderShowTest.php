<?php

use App\Models\Business;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->business = Business::factory()->for($this->user, 'owner')->create();
    actingAs($this->user);
});

function makeOrder(Business $business, array $extra = []): Order
{
    return Order::factory()->for($business)->create(array_merge([
        'order_id' => 'ORD-'.fake()->unique()->numerify('######'),
    ], $extra));
}

test('show ships customer_id so the customer card can link out', function () {
    $customer = Customer::factory()->for($this->business)->create();
    $order = makeOrder($this->business, ['customer_id' => $customer->id]);

    $this->get(route('businesses.orders.show', [$this->business, $order->order_id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Orders/Show')
            ->where('order.customer_id', $customer->id)
        );
});

test('show eager-loads only the product slug for item links', function () {
    $product = Product::factory()->for($this->business)->create();
    $order = makeOrder($this->business);
    OrderItem::factory()->for($order)->for($product)->create();

    $this->get(route('businesses.orders.show', [$this->business, $order->order_id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Orders/Show')
            ->where('order.items.0.product.slug', $product->slug)
            ->missing('order.items.0.product.name')
            ->missing('order.items.0.product.description')
        );
});

test('show payment_ref is available for linking to payment', function () {
    $order = makeOrder($this->business, ['payment_ref' => 'ref_abc123']);

    $this->get(route('businesses.orders.show', [$this->business, $order->order_id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('order.payment_ref', 'ref_abc123')
        );
});
