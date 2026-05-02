<?php

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Models\SubscriptionInvoice;
use App\Models\User;
use App\Services\Payments\VerificationResult;
use App\Services\Subscription\SubscriptionActivation;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->business = Business::factory()->for($this->owner, 'owner')->create();
    $this->invoice = SubscriptionInvoice::factory()
        ->for($this->business)
        ->state(['tier' => SubscriptionTier::Pro, 'amount' => 69])
        ->create();

    $this->activation = app(SubscriptionActivation::class);
});

function passingResult(string $reference, int $amount = 6900): VerificationResult
{
    return new VerificationResult(
        successful: true,
        reference: $reference,
        transactionId: 'txn_test_42',
        amountInMinorUnit: $amount,
        currency: 'GHS',
        metadata: ['customer' => ['customer_code' => 'CUS_x']],
    );
}

test('activation marks the invoice paid and sets a 30-day period', function () {
    $invoice = $this->activation->activate($this->invoice->reference, passingResult($this->invoice->reference));

    expect($invoice->status)->toBe(SubscriptionInvoice::STATUS_PAID)
        ->and($invoice->paid_at)->not->toBeNull();

    $days = (int) round(abs($invoice->period_start->diffInDays($invoice->period_end)));
    expect($days)->toBeGreaterThanOrEqual(28)->and($days)->toBeLessThanOrEqual(31);

    $this->business->refresh();
    expect($this->business->subscription_tier)->toBe(SubscriptionTier::Pro)
        ->and($this->business->subscription_status)->toBe(Business::SUBSCRIPTION_STATUS_ACTIVE)
        ->and($this->business->subscription_customer_id)->toBe('CUS_x');
});

test('replaying activation does not double-charge the audit log', function () {
    $this->activation->activate($this->invoice->reference, passingResult($this->invoice->reference));
    $this->activation->activate($this->invoice->reference, passingResult($this->invoice->reference));

    expect($this->business->fresh()->subscriptionChanges()->count())->toBe(1);
});

test('renewal extends the period from the existing period_end, not now', function () {
    $existingEnd = now()->addDays(5)->startOfSecond();
    $this->business->update([
        'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
        'current_period_end' => $existingEnd,
    ]);

    $invoice = $this->activation->activate($this->invoice->reference, passingResult($this->invoice->reference));

    expect($invoice->period_start->equalTo($existingEnd))->toBeTrue()
        ->and($invoice->period_end->equalTo($existingEnd->copy()->addMonth()))->toBeTrue();

    expect($this->business->fresh()->current_period_end->equalTo($existingEnd->copy()->addMonth()))->toBeTrue();
});

test('amount mismatch throws and leaves invoice pending', function () {
    expect(fn () => $this->activation->activate($this->invoice->reference, passingResult($this->invoice->reference, 1234)))
        ->toThrow(DomainException::class);

    expect($this->invoice->fresh()->status)->toBe(SubscriptionInvoice::STATUS_PENDING);
});

test('manual mode activation sets active and clears any leftover Paystack subscription', function () {
    config()->set('services.paystack.secret', 'sk_test_fake');

    Http::fake([
        'api.paystack.co/subscription/disable' => Http::response(['status' => true], 200),
    ]);

    $this->business->update([
        'subscription_id' => 'SUB_old',
        'paystack_email_token' => 'tok_old',
        'subscription_status' => Business::SUBSCRIPTION_STATUS_PAST_DUE,
    ]);

    $manualInvoice = SubscriptionInvoice::factory()
        ->for($this->business)
        ->state([
            'tier' => SubscriptionTier::Pro,
            'amount' => 69,
            'metadata' => ['mode' => 'manual'],
        ])
        ->create();

    $this->activation->activate($manualInvoice->reference, passingResult($manualInvoice->reference));

    $this->business->refresh();
    expect($this->business->subscription_status)->toBe(Business::SUBSCRIPTION_STATUS_ACTIVE)
        ->and($this->business->subscription_id)->toBeNull()
        ->and($this->business->paystack_email_token)->toBeNull();

    Http::assertSent(function ($request) {
        $body = $request->data();

        return $request->url() === 'https://api.paystack.co/subscription/disable'
            && $body['code'] === 'SUB_old'
            && $body['token'] === 'tok_old';
    });
});
