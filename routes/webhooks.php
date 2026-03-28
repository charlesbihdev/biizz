<?php

use App\Http\Controllers\CheckoutController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Webhook Routes
|--------------------------------------------------------------------------
| These routes handle server-to-server callbacks from payment providers.
| No CSRF, no session, no middleware stack — just signature verification.
|
*/

Route::prefix('webhooks')->middleware('business')->group(function () {
    Route::post('/paystack/{business:slug}', [CheckoutController::class, 'webhook'])
        ->name('webhooks.paystack');

    Route::post('/junipay/{business:slug}', [CheckoutController::class, 'webhook'])
        ->name('webhooks.junipay');
});
