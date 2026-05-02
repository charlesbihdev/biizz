<?php

use App\Models\Business;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->business = Business::factory()->for($this->user, 'owner')->create();
});

test('billing page renders for the business owner', function () {
    actingAs($this->user);

    $this->get(route('businesses.billing.show', $this->business))
        ->assertOk()
        ->assertInertia(
            fn (AssertableInertia $page) => $page
                ->component('Admin/Billing/Index')
                ->where('business.id', $this->business->id)
                ->has('invoices')
        );
});

test('billing page is forbidden for non-owners', function () {
    actingAs(User::factory()->create());

    $this->get(route('businesses.billing.show', $this->business))
        ->assertForbidden();
});

test('billing page redirects unauthenticated visitors to login', function () {
    $this->get(route('businesses.billing.show', $this->business))
        ->assertRedirect(route('login'));
});
