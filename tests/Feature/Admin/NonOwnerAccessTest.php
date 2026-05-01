<?php

use App\Models\Business;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->business = Business::factory()->for($this->owner, 'owner')->create();

    $this->intruder = User::factory()->create();
    actingAs($this->intruder);
});

test('non-owner is forbidden on every business-scoped admin route', function (string $routeName) {
    $this->get(route($routeName, ['business' => $this->business]))->assertForbidden();
})->with([
    'businesses.show',
    'businesses.settings.edit',
    'businesses.products.index',
    'businesses.products.create',
    'businesses.payments.index',
    'businesses.orders.index',
    'businesses.customers.index',
    'businesses.categories.index',
    'businesses.pages.index',
    'businesses.theme.edit',
]);

test('unauthenticated visitor is redirected to login on business-scoped route', function () {
    auth()->logout();

    $this->get(route('businesses.show', ['business' => $this->business]))
        ->assertRedirect(route('login'));
});
