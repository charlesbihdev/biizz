<?php

use App\Http\Controllers\Admin\BusinessController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ThemeSettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes (Authenticated)
|--------------------------------------------------------------------------
| All routes require auth + email verification.
| Business-specific routes additionally require the 'business' middleware
| which sets BusinessContext for the request lifecycle.
|
*/

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {

    // Business management (no business middleware — user is selecting which business to manage)
    Route::resource('businesses', BusinessController::class)
        ->only(['index', 'create', 'store', 'show', 'destroy']);

    // Business-scoped routes — ResolveBusiness middleware kicks in here
    Route::prefix('businesses/{business:slug}')
        ->middleware('business')
        ->name('businesses.')
        ->group(function () {

            // Theme settings
            Route::get('/theme', [ThemeSettingsController::class, 'edit'])
                ->name('theme.edit');
            Route::patch('/theme', [ThemeSettingsController::class, 'update'])
                ->name('theme.update');
            Route::patch('/theme/switch/{themeId}', [ThemeSettingsController::class, 'switchTheme'])
                ->name('theme.switch');

            // Payment settings
            Route::get('/payment', [PaymentController::class, 'edit'])
                ->name('payment.edit');
            Route::post('/payment', [PaymentController::class, 'store'])
                ->name('payment.store');
            Route::delete('/payment/{provider}', [PaymentController::class, 'destroy'])
                ->name('payment.destroy');

            // Products
            Route::resource('products', ProductController::class)
                ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
                ->names('products');
        });
});
