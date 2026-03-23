<?php

use App\Http\Controllers\Admin\BusinessController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ThemeSettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Business Admin Routes
|--------------------------------------------------------------------------
| All routes require auth + email verification.
| Business-specific routes additionally require the 'business' middleware
| which resolves BusinessContext for the request lifecycle.
|
| URL structure: /dashboard/b/{slug}/...
|
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // Business selection (no business context — user is browsing their stores)
    Route::prefix('dashboard/b')->name('businesses.')->controller(BusinessController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
    });

    // Business-scoped routes — 'business' middleware resolves + checks ownership
    Route::prefix('dashboard/b/{business:slug}')
        ->middleware('business')
        ->name('businesses.')
        ->group(function () {

            Route::get('/', [BusinessController::class, 'show'])->name('show');
            Route::delete('/', [BusinessController::class, 'destroy'])->name('destroy');
            Route::patch('/toggle', [BusinessController::class, 'toggle'])->name('toggle');
            Route::get('/settings', [BusinessController::class, 'editSettings'])->name('settings.edit');
            Route::patch('/settings', [BusinessController::class, 'updateSettings'])->name('settings.update');

            // Products
            Route::prefix('products')->name('products.')->controller(ProductController::class)->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/new', 'create')->name('create');
                Route::post('/', 'store')->name('store');
                Route::get('/{product}', 'edit')->name('edit');
                Route::patch('/{product}', 'update')->name('update');
                Route::delete('/{product}', 'destroy')->name('destroy');
            });

            // Theme
            Route::prefix('theme')->name('theme.')->controller(ThemeSettingsController::class)->group(function () {
                Route::get('/', 'edit')->name('edit');
                Route::patch('/', 'update')->name('update');
                Route::patch('/switch/{themeId}', 'switchTheme')->name('switch');
            });

            // Payments
            Route::prefix('payments')->name('payments.')->controller(PaymentController::class)->group(function () {
                Route::get('/', 'edit')->name('edit');
                Route::post('/', 'store')->name('store');
                Route::delete('/{provider}', 'destroy')->name('destroy');
            });

            // Categories
            Route::prefix('categories')->name('categories.')->controller(CategoryController::class)->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/', 'store')->name('store');
                Route::patch('/{category}', 'update')->name('update');
                Route::delete('/{category}', 'destroy')->name('destroy');
            });

            // Media uploads (theme images etc.)
            Route::post('media', [MediaController::class, 'store'])->name('media.store');
        });
});
