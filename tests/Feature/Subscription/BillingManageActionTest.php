<?php

use App\Models\Business;
use App\Models\User;
use Illuminate\Support\Facades\Http;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    config()->set('services.paystack.secret', 'sk_test_fake');

    $this->owner = User::factory()->create();
    $this->business = Business::factory()->for($this->owner, 'owner')->create([
        'subscription_id' => 'SUB_live',
        'paystack_email_token' => 'tok_live',
        'subscription_status' => Business::SUBSCRIPTION_STATUS_PAST_DUE,
    ]);
});

test('owner is redirected to the Paystack manage portal on success', function () {
    Http::fake([
        'api.paystack.co/subscription/SUB_live/manage/link' => Http::response([
            'status' => true,
            'data' => ['link' => 'https://paystack.com/manage/abc'],
        ], 200),
    ]);

    $response = actingAs($this->owner)
        ->withHeader('X-Inertia', 'true')
        ->post(route('businesses.billing.manage', $this->business));

    $response->assertStatus(409);
    expect($response->headers->get('x-inertia-location'))->toBe('https://paystack.com/manage/abc');
});

test('non-owner gets 403', function () {
    actingAs(User::factory()->create())
        ->post(route('businesses.billing.manage', $this->business))
        ->assertForbidden();
});

test('flashes an error and redirects when Paystack rejects the request', function () {
    Http::fake([
        'api.paystack.co/subscription/SUB_live/manage/link' => Http::response([
            'status' => false,
            'message' => 'something broke',
        ], 422),
    ]);

    actingAs($this->owner)
        ->post(route('businesses.billing.manage', $this->business))
        ->assertRedirect(route('businesses.billing.show', $this->business))
        ->assertSessionHas('error');
});

test('flashes an error when the business has no card subscription to manage', function () {
    $this->business->update(['subscription_id' => null]);

    actingAs($this->owner)
        ->post(route('businesses.billing.manage', $this->business))
        ->assertRedirect(route('businesses.billing.show', $this->business))
        ->assertSessionHas('error');
});
