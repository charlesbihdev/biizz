<?php

use App\Models\Buyer;
use App\Models\User;
use App\Services\BusinessContext;

afterEach(fn () => BusinessContext::clear());

test('signed-in admin hitting /login is redirected to dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'web')
        ->get(route('login'))
        ->assertRedirect(route('dashboard'));
});

test('signed-in buyer hitting /marketplace/login is redirected to library', function () {
    $buyer = Buyer::factory()->create();

    $this->actingAs($buyer, 'buyer')
        ->get(route('marketplace.login'))
        ->assertRedirect(route('marketplace.library.index'));
});

test('admin destination is unaffected by a stale buyer session', function () {
    $user = User::factory()->create();
    $buyer = Buyer::factory()->create();

    $this->actingAs($buyer, 'buyer');

    $this->actingAs($user, 'web')
        ->get(route('login'))
        ->assertRedirect(route('dashboard'));
});
