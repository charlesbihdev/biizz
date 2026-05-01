<?php

use App\Models\Business;
use App\Models\Buyer;
use App\Models\MarketplacePayment;
use App\Models\MarketplacePurchase;
use App\Models\Product;
use App\Models\User;
use App\Notifications\MarketplacePurchaseNotification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Testing\TestResponse;

beforeEach(function () {
    config(['services.paystack.secret' => 'sk_test_secret']);

    $owner = User::factory()->create();
    $this->business = Business::factory()->for($owner, 'owner')->create(['business_type' => 'digital']);
    $this->buyer = Buyer::factory()->create();
    $this->product = Product::factory()->for($this->business)->create(['price' => 50.00]);

    $this->purchase = MarketplacePurchase::factory()
        ->for($this->buyer)
        ->for($this->product)
        ->create([
            'business_id' => $this->business->id,
            'amount_paid' => 50.00,
            'status' => 'pending',
            'payment_ref' => 'mref_TEST123',
        ]);

    MarketplacePayment::factory()
        ->for($this->business)
        ->for($this->purchase, 'purchase')
        ->create(['reference' => 'mref_TEST123', 'amount' => 50.00]);
});

function fakePaystackVerifySuccess(int $amountInPesewas, string $reference): void
{
    Http::fake([
        '*/transaction/verify/*' => Http::response([
            'data' => [
                'status' => 'success',
                'reference' => $reference,
                'id' => 999,
                'amount' => $amountInPesewas,
                'currency' => 'GHS',
            ],
        ]),
    ]);
}

function postPaystackWebhook(string $reference, string $secret = 'sk_test_secret'): TestResponse
{
    $body = json_encode(['data' => ['reference' => $reference]]);
    $signature = hash_hmac('sha512', $body, $secret);

    return test()->call('POST', '/webhooks/paystack/marketplace', [], [], [], [
        'HTTP_X_PAYSTACK_SIGNATURE' => $signature,
        'CONTENT_TYPE' => 'application/json',
    ], $body);
}

test('marketplace webhook flips purchase to paid and notifies buyer once', function () {
    Notification::fake();
    fakePaystackVerifySuccess(5000, 'mref_TEST123');

    postPaystackWebhook('mref_TEST123')->assertOk();

    expect($this->purchase->refresh()->status)->toBe('paid');
    Notification::assertSentToTimes($this->buyer, MarketplacePurchaseNotification::class, 1);
});

test('marketplace webhook is idempotent — second call does not re-notify', function () {
    Notification::fake();
    fakePaystackVerifySuccess(5000, 'mref_TEST123');

    postPaystackWebhook('mref_TEST123')->assertOk();
    postPaystackWebhook('mref_TEST123')->assertOk();

    expect($this->purchase->refresh()->status)->toBe('paid');
    Notification::assertSentToTimes($this->buyer, MarketplacePurchaseNotification::class, 1);
});

test('marketplace webhook rejects invalid signature', function () {
    Notification::fake();

    $response = $this->postJson('/webhooks/paystack/marketplace', ['data' => ['reference' => 'mref_TEST123']], [
        'x-paystack-signature' => 'wrong',
    ]);

    $response->assertStatus(400);

    expect($this->purchase->refresh()->status)->toBe('pending');
    Notification::assertNothingSent();
});

test('marketplace webhook marks payment failed on amount mismatch', function () {
    Notification::fake();
    fakePaystackVerifySuccess(99, 'mref_TEST123'); // wrong amount

    postPaystackWebhook('mref_TEST123')->assertOk();

    expect($this->purchase->refresh()->status)->toBe('pending');
    Notification::assertNothingSent();
});
