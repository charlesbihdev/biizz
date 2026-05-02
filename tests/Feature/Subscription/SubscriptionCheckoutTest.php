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

test('owner can start a card auto-renew checkout for a paid tier', function () {
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
        ->post(route('businesses.billing.checkout', $this->business), [
            'target' => 'pro',
            'mode' => 'auto',
        ]);

    $response->assertStatus(409);
    expect($response->headers->get('x-inertia-location'))->toBe('https://checkout.paystack.com/abc');

    expect(SubscriptionInvoice::query()->count())->toBe(1);

    $invoice = SubscriptionInvoice::query()->first();
    expect($invoice->business_id)->toBe($this->business->id)
        ->and($invoice->tier)->toBe(SubscriptionTier::Pro)
        ->and($invoice->status)->toBe(SubscriptionInvoice::STATUS_PENDING)
        ->and($invoice->metadata['mode'] ?? null)->toBe('auto')
        ->and($invoice->reference)->not->toBeEmpty();

    Http::assertSent(function ($request) {
        $body = $request->data();

        return $request->url() === 'https://api.paystack.co/transaction/initialize'
            && ($body['plan'] ?? null) === 'PLN_pro_test'
            && $body['amount'] === 6900
            && $body['email'] === $this->owner->email;
    });
});

test('manual checkout omits the plan code from the Paystack payload', function () {
    Http::fake([
        'api.paystack.co/transaction/initialize' => Http::response([
            'status' => true,
            'data' => [
                'authorization_url' => 'https://checkout.paystack.com/manual',
                'access_code' => 'ACCESS_manual',
                'reference' => 'will-be-overridden',
            ],
        ], 200),
    ]);

    actingAs($this->owner)
        ->withHeader('X-Inertia', 'true')
        ->post(route('businesses.billing.checkout', $this->business), [
            'target' => 'pro',
            'mode' => 'manual',
        ])
        ->assertStatus(409);

    $invoice = SubscriptionInvoice::query()->firstOrFail();
    expect($invoice->metadata['mode'] ?? null)->toBe('manual');

    Http::assertSent(function ($request) {
        $body = $request->data();

        return $request->url() === 'https://api.paystack.co/transaction/initialize'
            && ! array_key_exists('plan', $body);
    });
});

test('non-owner gets 403', function () {
    $stranger = User::factory()->create();

    actingAs($stranger)
        ->post(route('businesses.billing.checkout', $this->business), [
            'target' => 'pro',
            'mode' => 'auto',
        ])
        ->assertForbidden();

    expect(SubscriptionInvoice::query()->count())->toBe(0);
});

test('choosing free is rejected by validation', function () {
    actingAs($this->owner)
        ->post(route('businesses.billing.checkout', $this->business), [
            'target' => 'free',
            'mode' => 'auto',
        ])
        ->assertSessionHasErrors('target');
});

test('mode is required and must be auto or manual', function () {
    actingAs($this->owner)
        ->post(route('businesses.billing.checkout', $this->business), ['target' => 'pro'])
        ->assertSessionHasErrors('mode');

    actingAs($this->owner)
        ->post(route('businesses.billing.checkout', $this->business), [
            'target' => 'pro',
            'mode' => 'crypto',
        ])
        ->assertSessionHasErrors('mode');
});

test('choosing the current tier is rejected unless restoring past_due via manual', function () {
    $this->business->setTier(SubscriptionTier::Pro);

    actingAs($this->owner)
        ->post(route('businesses.billing.checkout', $this->business), [
            'target' => 'pro',
            'mode' => 'auto',
        ])
        ->assertSessionHasErrors('target');

    $this->business->update(['subscription_status' => Business::SUBSCRIPTION_STATUS_PAST_DUE]);

    Http::fake([
        'api.paystack.co/transaction/initialize' => Http::response([
            'status' => true,
            'data' => [
                'authorization_url' => 'https://checkout.paystack.com/restore',
                'access_code' => 'ACCESS_restore',
                'reference' => 'will-be-overridden',
            ],
        ], 200),
    ]);

    actingAs($this->owner)
        ->withHeader('X-Inertia', 'true')
        ->post(route('businesses.billing.checkout', $this->business), [
            'target' => 'pro',
            'mode' => 'manual',
        ])
        ->assertStatus(409);
});

test('active manual subscriber can re-checkout the same tier to renew', function () {
    $this->business->setTier(SubscriptionTier::Pro);
    $this->business->update([
        'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
        'subscription_id' => null,
        'current_period_end' => now()->addDays(2),
    ]);

    Http::fake([
        'api.paystack.co/transaction/initialize' => Http::response([
            'status' => true,
            'data' => [
                'authorization_url' => 'https://checkout.paystack.com/renew',
                'access_code' => 'ACCESS_renew',
                'reference' => 'will-be-overridden',
            ],
        ], 200),
    ]);

    actingAs($this->owner)
        ->withHeader('X-Inertia', 'true')
        ->post(route('businesses.billing.checkout', $this->business), [
            'target' => 'pro',
            'mode' => 'manual',
        ])
        ->assertStatus(409);
});

test('active card subscriber cannot re-checkout the same tier via manual', function () {
    $this->business->setTier(SubscriptionTier::Pro);
    $this->business->update([
        'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
        'subscription_id' => 'SUB_live',
    ]);

    actingAs($this->owner)
        ->post(route('businesses.billing.checkout', $this->business), [
            'target' => 'pro',
            'mode' => 'manual',
        ])
        ->assertSessionHasErrors('target');
});

test('checkout fails gracefully when auto plan code is missing', function () {
    config()->set('biizz.tiers.pro.paystack_plan_code', null);

    actingAs($this->owner)
        ->post(route('businesses.billing.checkout', $this->business), [
            'target' => 'pro',
            'mode' => 'auto',
        ])
        ->assertRedirect(route('businesses.billing.show', $this->business))
        ->assertSessionHas('error');
});
