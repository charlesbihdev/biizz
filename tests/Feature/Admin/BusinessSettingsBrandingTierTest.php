<?php

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->business = Business::factory()->for($this->user, 'owner')->create([
        'show_branding' => true,
    ]);
    actingAs($this->user);
});

test('free businesses cannot turn off biizz branding even via direct request', function () {
    $this->patch(route('businesses.settings.update', $this->business), [
        'name' => $this->business->name,
        'customer_login_mode' => 'checkout',
        'show_branding' => false,
    ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    // Backend force-flips it back to true regardless of submitted value.
    expect($this->business->fresh()->show_branding)->toBeTrue();
});

test('pro businesses can turn off biizz branding', function () {
    $this->business->setTier(SubscriptionTier::Pro);

    $this->patch(route('businesses.settings.update', $this->business), [
        'name' => $this->business->name,
        'customer_login_mode' => 'checkout',
        'show_branding' => false,
    ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($this->business->fresh()->show_branding)->toBeFalse();
});

test('pro_max businesses can turn off biizz branding', function () {
    $this->business->setTier(SubscriptionTier::ProMax);

    $this->patch(route('businesses.settings.update', $this->business), [
        'name' => $this->business->name,
        'customer_login_mode' => 'checkout',
        'show_branding' => false,
    ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($this->business->fresh()->show_branding)->toBeFalse();
});

test('pro businesses can re-enable branding after turning it off', function () {
    $this->business->setTier(SubscriptionTier::Pro);
    $this->business->update(['show_branding' => false]);

    $this->patch(route('businesses.settings.update', $this->business), [
        'name' => $this->business->name,
        'customer_login_mode' => 'checkout',
        'show_branding' => true,
    ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($this->business->fresh()->show_branding)->toBeTrue();
});
