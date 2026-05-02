<?php

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Models\User;
use App\Notifications\SubscriptionRenewalDueNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    config()->set('biizz.subscription.manual_renewal_reminder_days_before_end', 3);

    $this->owner = User::factory()->create();
    $this->business = Business::factory()->for($this->owner, 'owner')->create();
    $this->business->setTier(SubscriptionTier::Pro);
});

test('manual subscription nearing period_end gets a reminder', function () {
    Notification::fake();

    $this->business->update([
        'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
        'subscription_id' => null,
        'current_period_end' => Carbon::now()->addDays(2),
    ]);

    $this->artisan('subscription:remind')->assertSuccessful();

    Notification::assertSentTo($this->owner, SubscriptionRenewalDueNotification::class);
});

test('card subscription with the same dates is not reminded', function () {
    Notification::fake();

    $this->business->update([
        'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
        'subscription_id' => 'SUB_card',
        'current_period_end' => Carbon::now()->addDays(2),
    ]);

    $this->artisan('subscription:remind')->assertSuccessful();

    Notification::assertNothingSent();
});

test('manual subscription outside the reminder window is not reminded', function () {
    Notification::fake();

    $this->business->update([
        'subscription_status' => Business::SUBSCRIPTION_STATUS_ACTIVE,
        'subscription_id' => null,
        'current_period_end' => Carbon::now()->addDays(20),
    ]);

    $this->artisan('subscription:remind')->assertSuccessful();

    Notification::assertNothingSent();
});
