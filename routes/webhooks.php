<?php

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\MarketplacePurchaseController;
use App\Http\Controllers\Webhooks\PaystackSubscriptionWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Webhook Routes
|--------------------------------------------------------------------------
| These routes handle server-to-server callbacks from payment providers.
| No CSRF, no session, no middleware stack — just signature verification.
|
*/

// Marketplace webhook — no business slug, uses platform Paystack key.
// Must be registered BEFORE the {business:slug} routes below, otherwise
// "marketplace" gets matched as a business slug and 404s on model binding.
Route::post('/webhooks/paystack/marketplace', [MarketplacePurchaseController::class, 'webhook'])
    ->name('webhooks.paystack.marketplace');

// Subscription webhook — also platform-keyed, no business slug. Registered
// before the {business:slug} group for the same reason.
Route::post('/webhooks/paystack/subscription', PaystackSubscriptionWebhookController::class)
    ->name('webhooks.paystack.subscription');

Route::prefix('webhooks')->middleware('business')->group(function () {
    Route::post('/paystack/{business:slug}', [CheckoutController::class, 'webhook'])
        ->name('webhooks.paystack');

    Route::post('/junipay/{business:slug}', [CheckoutController::class, 'webhook'])
        ->name('webhooks.junipay');
});
