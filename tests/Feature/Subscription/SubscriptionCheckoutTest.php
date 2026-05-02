<?php

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Models\SubscriptionInvoice;
use App\Models\User;
use Illuminate\Support\Facades\Http;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    config()->set('services.paystack.secret', 'sk_test_fake');
    config()->set('biizz.tiers.pro.paystack_plan_code', 'PLN_pro_test');
    config()->set('biizz.tiers.pro_max.paystack_plan_code', 'PLN_promax_test');

    $this->owner = User::factory()->create();
    $this->business = Business::factory()->for($this->owner, 'owner')->create();
});

test('owner can start a checkout for a paid tier', function () {
    Http::fake([
        'api.paystack.co/transaction/initialize' => Http::response([
            'status' => true,
            'data' => [
                'authorization_url' => 'https://checkout.paystack.com/abc',
                'access_code' => 'ACCESS_xyz',
                'reference' => 'will-be-overridden',
            ],
        ], 200),
    ]);

    $response = actingAs($this->owner)
        ->withHeader('X-Inertia', 'true')
        ->post(route('businesses.billing.checkout', $this->business), ['target' => 'pro']);

    $response->assertStatus(409);
    expect($response->headers->get('x-inertia-location'))->toBe('https://checkout.paystack.com/abc');

    expect(SubscriptionInvoice::query()->count())->toBe(1);

    $invoice = SubscriptionInvoice::query()->first();
    expect($invoice->business_id)->toBe($this->business->id)
        ->and($invoice->tier)->toBe(SubscriptionTier::Pro)
        ->and($invoice->status)->toBe(SubscriptionInvoice::STATUS_PENDING)
        ->and($invoice->reference)->not->toBeEmpty();

    Http::assertSent(function ($request) {
        $body = $request->data();

        return $request->url() === 'https://api.paystack.co/transaction/initialize'
            && $body['plan'] === 'PLN_pro_test'
            && $body['amount'] === 6900
            && $body['email'] === $this->owner->email;
    });
});

test('non-owner gets 403', function () {
    $stranger = User::factory()->create();

    actingAs($stranger)
        ->post(route('businesses.billing.checkout', $this->business), ['target' => 'pro'])
        ->assertForbidden();

    expect(SubscriptionInvoice::query()->count())->toBe(0);
});

test('choosing free is rejected by validation', function () {
    actingAs($this->owner)
        ->post(route('businesses.billing.checkout', $this->business), ['target' => 'free'])
        ->assertSessionHasErrors('target');
});

test('choosing the current tier is rejected', function () {
    $this->business->setTier(SubscriptionTier::Pro);

    actingAs($this->owner)
        ->post(route('businesses.billing.checkout', $this->business), ['target' => 'pro'])
        ->assertSessionHasErrors('target');
});

test('checkout fails gracefully when plan code is missing', function () {
    config()->set('biizz.tiers.pro.paystack_plan_code', null);

    actingAs($this->owner)
        ->post(route('businesses.billing.checkout', $this->business), ['target' => 'pro'])
        ->assertRedirect(route('businesses.billing.show', $this->business))
        ->assertSessionHas('error');
});
