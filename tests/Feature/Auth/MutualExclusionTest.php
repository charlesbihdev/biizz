<?php

use App\Models\Business;
use App\Models\Buyer;
use App\Models\Customer;
use App\Models\User;
use App\Services\BusinessContext;

afterEach(fn () => BusinessContext::clear());

test('admin login signs the visitor out of customer and buyer guards', function () {
    $business = Business::factory()->active()->create();
    $customer = Customer::factory()->for($business)->create();
    $buyer = Buyer::factory()->create();
    $owner = User::factory()->create();

    $this->post(route('customer.auth.login', ['business' => $business]), [
        'email' => $customer->email,
        'password' => 'password',
    ]);
    BusinessContext::clear();

    $this->post(route('marketplace.login.store'), [
        'email' => $buyer->email,
        'password' => 'password',
    ]);

    $this->post(route('login.store'), [
        'email' => $owner->email,
        'password' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticatedAs($owner, 'web');
    $this->assertGuest('customer');
    $this->assertGuest('buyer');
});

test('buyer login signs the visitor out of web and customer guards', function () {
    $business = Business::factory()->active()->create();
    $customer = Customer::factory()->for($business)->create();
    $owner = User::factory()->create();
    $buyer = Buyer::factory()->create();

    $this->post(route('login.store'), [
        'email' => $owner->email,
        'password' => 'password',
    ]);

    $this->post(route('customer.auth.login', ['business' => $business]), [
        'email' => $customer->email,
        'password' => 'password',
    ]);
    BusinessContext::clear();

    $this->post(route('marketplace.login.store'), [
        'email' => $buyer->email,
        'password' => 'password',
    ])->assertRedirect();

    $this->assertAuthenticatedAs($buyer, 'buyer');
    $this->assertGuest('web');
    $this->assertGuest('customer');
});

test('customer login signs the visitor out of web and buyer guards', function () {
    $business = Business::factory()->active()->create();
    $customer = Customer::factory()->for($business)->create();
    $owner = User::factory()->create();
    $buyer = Buyer::factory()->create();

    $this->post(route('login.store'), [
        'email' => $owner->email,
        'password' => 'password',
    ]);

    $this->post(route('marketplace.login.store'), [
        'email' => $buyer->email,
        'password' => 'password',
    ]);

    $this->post(route('customer.auth.login', ['business' => $business]), [
        'email' => $customer->email,
        'password' => 'password',
    ])->assertRedirect();

    $this->assertAuthenticatedAs($customer, 'customer');
    $this->assertGuest('web');
    $this->assertGuest('buyer');
});

test('admin login does not throw when a real customer session exists', function () {
    // Reproduces the production bug where /login crashed because the Login
    // listener probed the customer guard, whose provider needs BusinessContext.
    // Uses a real two-request flow (not actingAs) so the SessionGuard cache is
    // empty on the /login request, forcing it down the retrieveById path.
    $business = Business::factory()->active()->create();
    $customer = Customer::factory()->for($business)->create();
    $owner = User::factory()->create();

    $this->post(route('customer.auth.login', ['business' => $business]), [
        'email' => $customer->email,
        'password' => 'password',
    ]);

    BusinessContext::clear();

    $this->post(route('login.store'), [
        'email' => $owner->email,
        'password' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticatedAs($owner, 'web');
    $this->assertGuest('customer');
});
