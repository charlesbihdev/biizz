<?php

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Models\SubscriptionInvoice;
use App\Models\User;
use Illuminate\Support\Facades\Http;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    config()->set('services.paystack.secret', 'sk_test_fake');

    $this->owner = User::factory()->create();
    $this->business = Business::factory()->for($this->owner, 'owner')->create();
    $this->invoice = SubscriptionInvoice::factory()
        ->for($this->business)
        ->state(['tier' => SubscriptionTier::Pro, 'amount' => 69])
        ->create();
});

test('successful callback flips the tier and marks the invoice paid', function () {
    Http::fake([
        'api.paystack.co/transaction/verify/*' => Http::response([
            'status' => true,
            'data' => [
                'status' => 'success',
                'reference' => $this->invoice->reference,
                'id' => 9999,
                'amount' => 6900,
                'currency' => 'GHS',
                'customer' => ['customer_code' => 'CUS_abc', 'email' => $this->owner->email],
                'authorization' => ['authorization_code' => 'AUTH_xyz'],
            ],
        ], 200),
    ]);

    actingAs($this->owner)
        ->get(route('businesses.billing.callback', $this->business).'?reference='.$this->invoice->reference)
        ->assertRedirect(route('businesses.billing.show', $this->business))
        ->assertSessionHas('success');

    $this->business->refresh();
    expect($this->business->subscription_tier)->toBe(SubscriptionTier::Pro)
        ->and($this->business->subscription_status)->toBe(Business::SUBSCRIPTION_STATUS_ACTIVE)
        ->and($this->business->current_period_end)->not->toBeNull()
        ->and($this->business->subscription_customer_id)->toBe('CUS_abc');

    expect($this->invoice->fresh()->status)->toBe(SubscriptionInvoice::STATUS_PAID);
    expect($this->business->subscriptionChanges()->count())->toBe(1);
});

test('failed verify leaves invoice and tier untouched', function () {
    Http::fake([
        'api.paystack.co/transaction/verify/*' => Http::response([
            'status' => true,
            'data' => ['status' => 'failed', 'reference' => $this->invoice->reference, 'amount' => 6900],
        ], 200),
    ]);

    actingAs($this->owner)
        ->get(route('businesses.billing.callback', $this->business).'?reference='.$this->invoice->reference)
        ->assertRedirect(route('businesses.billing.show', $this->business))
        ->assertSessionHas('error');

    expect($this->invoice->fresh()->status)->toBe(SubscriptionInvoice::STATUS_PENDING);
    expect($this->business->fresh()->subscription_tier)->toBe(SubscriptionTier::Free);
});

test('callback with missing reference returns to billing with notice', function () {
    actingAs($this->owner)
        ->get(route('businesses.billing.callback', $this->business))
        ->assertRedirect(route('businesses.billing.show', $this->business))
        ->assertSessionHas('error');
});

test('replaying a paid callback is idempotent', function () {
    Http::fake([
        'api.paystack.co/transaction/verify/*' => Http::response([
            'status' => true,
            'data' => [
                'status' => 'success',
                'reference' => $this->invoice->reference,
                'id' => 9999,
                'amount' => 6900,
                'currency' => 'GHS',
                'customer' => ['customer_code' => 'CUS_abc', 'email' => $this->owner->email],
            ],
        ], 200),
    ]);

    actingAs($this->owner)
        ->get(route('businesses.billing.callback', $this->business).'?reference='.$this->invoice->reference)
        ->assertRedirect();

    actingAs($this->owner)
        ->get(route('businesses.billing.callback', $this->business).'?reference='.$this->invoice->reference)
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($this->business->fresh()->subscriptionChanges()->count())->toBe(1);
});
