<?php

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Models\User;
use App\Notifications\SubscriptionLapsedNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    config()->set('biizz.subscription.lapse_grace_days', 3);

    $this->owner = User::factory()->create();
    $this->business = Business::factory()->for($this->owner, 'owner')->create();
    $this->business->setTier(SubscriptionTier::Pro);
});

test('manual subscription past period_end + grace lapses to Free', function () {
    Notification::fake();

    $this->business->update([
        'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
        'subscription_id' => null,
        'current_period_end' => Carbon::now()->subDays(5),
    ]);

    $this->artisan('subscription:expire')->assertSuccessful();

    $this->business->refresh();
    expect($this->business->subscription_tier)->toBe(SubscriptionTier::Free)
        ->and($this->business->subscription_status)->toBe(Business::SUBSCRIPTION_STATUS_INACTIVE);

    Notification::assertSentTo($this->owner, SubscriptionLapsedNotification::class);
});

test('past_due card subscription past grace also lapses to Free', function () {
    Notification::fake();

    $this->business->update([
        'subscription_status' => Business::SUBSCRIPTION_STATUS_PAST_DUE,
        'subscription_id' => 'SUB_dead',
        'paystack_email_token' => 'tok_dead',
        'current_period_end' => Carbon::now()->subDays(5),
    ]);

    $this->artisan('subscription:expire')->assertSuccessful();

    $this->business->refresh();
    expect($this->business->subscription_tier)->toBe(SubscriptionTier::Free)
        ->and($this->business->subscription_id)->toBeNull()
        ->and($this->business->paystack_email_token)->toBeNull();

    Notification::assertSentTo($this->owner, SubscriptionLapsedNotification::class);
});

test('healthy active card subscription is not touched', function () {
    Notification::fake();

    $this->business->update([
        'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
        'subscription_id' => 'SUB_live',
        'current_period_end' => Carbon::now()->subDays(5),
    ]);

    $this->artisan('subscription:expire')->assertSuccessful();

    expect($this->business->fresh()->subscription_tier)->toBe(SubscriptionTier::Pro);
    Notification::assertNothingSent();
});

test('businesses still inside the grace window are not lapsed', function () {
    Notification::fake();

    $this->business->update([
        'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
        'subscription_id' => null,
        'current_period_end' => Carbon::now()->subDays(1),
    ]);

    $this->artisan('subscription:expire')->assertSuccessful();

    expect($this->business->fresh()->subscription_tier)->toBe(SubscriptionTier::Pro);
    Notification::assertNothingSent();
});
