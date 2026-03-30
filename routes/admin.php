<?php

use App\Http\Controllers\Admin\BusinessController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ThemeSettingsController;
use App\Models\Business;
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

            // Payments (connect/disconnect/default actions; the GET redirects to settings)
            Route::prefix('payments')->name('payments.')->group(function () {
                Route::get('/', fn (Business $business) => redirect()->route('businesses.settings.edit', $business))->name('edit');
                Route::post('/', [PaymentController::class, 'store'])->name('store');
                Route::patch('/default', [PaymentController::class, 'setDefault'])->name('setDefault');
                Route::delete('/{provider}', [PaymentController::class, 'destroy'])->name('destroy');
            });

            // Categories
            Route::prefix('categories')->name('categories.')->controller(CategoryController::class)->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/', 'store')->name('store');
                Route::patch('/{category}', 'update')->name('update');
                Route::delete('/{category}', 'destroy')->name('destroy');
            });

            // Orders
            Route::prefix('orders')->name('orders.')->controller(OrderController::class)->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/{order:order_id}', 'show')->name('show');
                Route::patch('/{order:order_id}/status', 'updateStatus')->name('updateStatus');
            });

            // Pages
            Route::prefix('pages')->name('pages.')->controller(PageController::class)->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/new', 'create')->name('create');
                Route::post('/', 'store')->name('store');
                Route::get('/{page}', 'edit')->name('edit');
                Route::patch('/{page}', 'update')->name('update');
                Route::delete('/{page}', 'destroy')->name('destroy');
                Route::patch('/{page}/publish', 'togglePublish')->name('publish');
            });

            // Media uploads (theme images etc.)
            Route::post('media', [MediaController::class, 'store'])->name('media.store');

            // Digital product file uploads (50 MB limit)
            Route::post('products/{product}/files', [MediaController::class, 'storeFile'])->name('products.files.store');
        });
});
