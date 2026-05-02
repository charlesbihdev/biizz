<?php

use App\Http\Controllers\Admin\BillingController;
use App\Http\Controllers\Admin\BusinessController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PageController;
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

    // Business-scoped routes — 'business' resolves the URL, 'business.owner' enforces ownership
    Route::prefix('dashboard/b/{business:slug}')
        ->middleware(['business', 'business.owner'])
        ->name('businesses.')
        ->group(function () {

            Route::get('/', [BusinessController::class, 'show'])->name('show');
            Route::delete('/', [BusinessController::class, 'destroy'])->name('destroy');
            Route::patch('/toggle', [BusinessController::class, 'toggle'])->name('toggle');
            Route::get('/settings', [BusinessController::class, 'editSettings'])->name('settings.edit');
            Route::patch('/settings', [BusinessController::class, 'updateSettings'])->name('settings.update');

            // Billing — Paystack subscription billing for paid plans.
            Route::prefix('billing')->name('billing.')->controller(BillingController::class)->group(function () {
                Route::get('/', 'show')->name('show');
                Route::post('/checkout', 'checkout')->name('checkout');
                Route::get('/callback', 'callback')->name('callback');
                Route::post('/cancel', 'cancel')->name('cancel');
                Route::post('/resume', 'resume')->name('resume');
                Route::post('/manage', 'manage')->name('manage');
            });

            // Products
            Route::prefix('products')->name('products.')->controller(ProductController::class)->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/new', 'create')->name('create');
                Route::post('/', 'store')->name('store');
                Route::get('/{product:slug}', 'edit')->name('edit');
                Route::patch('/{product:slug}', 'update')->name('update');
                Route::delete('/{product:slug}', 'destroy')->name('destroy');
            });

            // Theme
            Route::prefix('theme')->name('theme.')->controller(ThemeSettingsController::class)->group(function () {
                Route::get('/', 'edit')->name('edit');
                Route::patch('/', 'update')->name('update');
                Route::patch('/switch/{themeId}', 'switchTheme')->name('switch');
            });

            // Payments — ledger (index/show) + provider config (store/setDefault/destroy)
            Route::prefix('payments')->name('payments.')->controller(PaymentController::class)->group(function () {
                Route::get('/', 'index')->name('index');
                // Business has no `payment()` relation Laravel can derive for scoped binding;
                // ownership is enforced by BusinessScope on the MarketplacePayment model.
                Route::get('/marketplace/{payment:reference}', 'showMarketplace')->withoutScopedBindings()->name('marketplace.show');
                Route::get('/{payment:reference}', 'show')->name('show');
                Route::post('/', 'store')->name('store');
                Route::patch('/default', 'setDefault')->name('setDefault');
                Route::delete('/{provider}', 'destroy')->name('destroy');
            });

            // Categories
            Route::prefix('categories')->name('categories.')->controller(CategoryController::class)->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/', 'store')->name('store');
                Route::patch('/{category}', 'update')->name('update');
                Route::delete('/{category}', 'destroy')->name('destroy');
            });

            // Customers
            Route::prefix('customers')->name('customers.')->controller(CustomerController::class)->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/{customer}', 'show')->name('show');
                Route::patch('/{customer}', 'update')->name('update');
                Route::patch('/{customer}/block', 'toggleBlock')->name('block');
                Route::delete('/{customer}', 'destroy')->name('destroy');
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
                Route::get('/{page:slug}', 'edit')->name('edit');
                Route::patch('/{page:slug}', 'update')->name('update');
                Route::delete('/{page:slug}', 'destroy')->name('destroy');
                Route::patch('/{page:slug}/publish', 'togglePublish')->name('publish');
            });

            // Media uploads (theme images etc.)
            Route::post('media', [MediaController::class, 'store'])->name('media.store');

            // Digital product file uploads (50 MB limit)
            Route::post('products/{product:slug}/files', [MediaController::class, 'storeFile'])->name('products.files.store');
        });
});
