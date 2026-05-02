<?php

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Models\SubscriptionInvoice;
use App\Models\User;
use App\Services\Payments\VerificationResult;
use App\Services\Subscription\SubscriptionActivation;

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

test('amount mismatch throws and leaves invoice pending', function () {
    expect(fn () => $this->activation->activate($this->invoice->reference, passingResult($this->invoice->reference, 1234)))
        ->toThrow(DomainException::class);

    expect($this->invoice->fresh()->status)->toBe(SubscriptionInvoice::STATUS_PENDING);
});
