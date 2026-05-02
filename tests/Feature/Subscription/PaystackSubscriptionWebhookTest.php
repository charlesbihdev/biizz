<?php

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Models\SubscriptionInvoice;
use App\Models\User;

beforeEach(function () {
    config()->set('services.paystack.secret', 'sk_test_fake');

    $this->owner = User::factory()->create();
    $this->business = Business::factory()->for($this->owner, 'owner')->create();
});

function signedPayload(array $payload): array
{
    $body = json_encode($payload);

    return [
        'body' => $body,
        'signature' => hash_hmac('sha512', $body, 'sk_test_fake'),
    ];
}

test('rejects requests with an invalid signature', function () {
    $this->postJson(route('webhooks.paystack.subscription'), [
        'event' => 'charge.success',
        'data' => ['reference' => 'whatever'],
    ], [
        'x-paystack-signature' => 'not-the-right-hash',
    ])->assertStatus(400);
});

test('charge.success activates the matching invoice and is idempotent', function () {
    $invoice = SubscriptionInvoice::factory()
        ->for($this->business)
        ->state(['tier' => SubscriptionTier::Pro, 'amount' => 69])
        ->create();

    $payload = [
        'event' => 'charge.success',
        'data' => [
            'reference' => $invoice->reference,
            'id' => 1234,
            'amount' => 6900,
            'currency' => 'GHS',
            'customer' => ['email' => $this->owner->email, 'customer_code' => 'CUS_a'],
        ],
    ];

    $signed = signedPayload($payload);

    $this->call('POST', route('webhooks.paystack.subscription'),
        [], [], [], ['HTTP_X-Paystack-Signature' => $signed['signature'], 'CONTENT_TYPE' => 'application/json'],
        $signed['body'],
    )->assertOk();

    expect($invoice->fresh()->status)->toBe(SubscriptionInvoice::STATUS_PAID)
        ->and($this->business->fresh()->subscription_tier)->toBe(SubscriptionTier::Pro);

    // Replay — should be idempotent.
    $this->call('POST', route('webhooks.paystack.subscription'),
        [], [], [], ['HTTP_X-Paystack-Signature' => $signed['signature'], 'CONTENT_TYPE' => 'application/json'],
        $signed['body'],
    )->assertOk();

    expect($this->business->fresh()->subscriptionChanges()->count())->toBe(1);
});

test('subscription.create stores the subscription code and email token', function () {
    $payload = [
        'event' => 'subscription.create',
        'data' => [
            'subscription_code' => 'SUB_abc',
            'email_token' => 'tok_xyz',
            'customer' => ['email' => $this->owner->email, 'customer_code' => 'CUS_a'],
        ],
    ];

    $signed = signedPayload($payload);

    $this->call('POST', route('webhooks.paystack.subscription'),
        [], [], [], ['HTTP_X-Paystack-Signature' => $signed['signature'], 'CONTENT_TYPE' => 'application/json'],
        $signed['body'],
    )->assertOk();

    $this->business->refresh();
    expect($this->business->subscription_id)->toBe('SUB_abc')
        ->and($this->business->paystack_email_token)->toBe('tok_xyz')
        ->and($this->business->subscription_customer_id)->toBe('CUS_a')
        ->and($this->business->subscription_gateway)->toBe('paystack')
        ->and($this->business->subscription_status)->toBe(Business::SUBSCRIPTION_STATUS_ACTIVE);
});

test('invoice.payment_failed flips the business to past_due', function () {
    $this->business->update([
        'subscription_id' => 'SUB_abc',
        'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
    ]);

    $invoice = SubscriptionInvoice::factory()
        ->for($this->business)
        ->state([
            'tier' => SubscriptionTier::Pro,
            'gateway_invoice_id' => 'INV_42',
        ])
        ->create();

    $payload = [
        'event' => 'invoice.payment_failed',
        'data' => [
            'invoice_code' => 'INV_42',
            'subscription' => ['subscription_code' => 'SUB_abc'],
        ],
    ];

    $signed = signedPayload($payload);

    $this->call('POST', route('webhooks.paystack.subscription'),
        [], [], [], ['HTTP_X-Paystack-Signature' => $signed['signature'], 'CONTENT_TYPE' => 'application/json'],
        $signed['body'],
    )->assertOk();

    expect($invoice->fresh()->status)->toBe(SubscriptionInvoice::STATUS_FAILED)
        ->and($this->business->fresh()->subscription_status)->toBe(Business::SUBSCRIPTION_STATUS_PAST_DUE);
});

test('subscription.disable marks the business canceled', function () {
    $this->business->update([
        'subscription_id' => 'SUB_abc',
        'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
    ]);

    $payload = [
        'event' => 'subscription.disable',
        'data' => ['subscription_code' => 'SUB_abc'],
    ];

    $signed = signedPayload($payload);

    $this->call('POST', route('webhooks.paystack.subscription'),
        [], [], [], ['HTTP_X-Paystack-Signature' => $signed['signature'], 'CONTENT_TYPE' => 'application/json'],
        $signed['body'],
    )->assertOk();

    expect($this->business->fresh()->subscription_status)->toBe(Business::SUBSCRIPTION_STATUS_CANCELED);
});
