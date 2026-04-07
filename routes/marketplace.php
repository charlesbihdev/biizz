<?php

use App\Http\Controllers\CreatorCatalogController;
use App\Http\Controllers\MarketplaceAccountController;
use App\Http\Controllers\MarketplaceAuth\BecomeCreatorController;
use App\Http\Controllers\MarketplaceAuth\GoogleController;
use App\Http\Controllers\MarketplaceAuth\LoginController;
use App\Http\Controllers\MarketplaceAuth\LogoutController;
use App\Http\Controllers\MarketplaceAuth\RegisterController;
use App\Http\Controllers\MarketplaceController;
use App\Http\Controllers\MarketplaceLibraryController;
use App\Http\Controllers\MarketplacePurchaseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Marketplace Routes (Public — Platform-Level)
|--------------------------------------------------------------------------
| These routes serve the global marketplace at /marketplace.
| All digital products from all businesses appear here automatically.
|
*/

Route::get('/catalog/{business:slug}', [CreatorCatalogController::class, 'show'])->name('catalog.show');

// Buyer Google OAuth — mirrors /auth/customer/google/callback pattern
Route::prefix('auth/marketplace')->name('marketplace.auth.')->group(function () {
    Route::get('/google', [GoogleController::class, 'redirect'])->name('google');
    Route::get('/google/callback', [GoogleController::class, 'callback'])->name('google.callback');
});

Route::prefix('marketplace')->name('marketplace.')->group(function () {
    Route::get('/', [MarketplaceController::class, 'index'])->name('index');

    // Buyer auth (guest)
    Route::middleware('guest:buyer')->group(function () {
        Route::get('/login', [LoginController::class, 'create'])->name('login');
        Route::post('/login', [LoginController::class, 'store'])->name('login.store');
        Route::get('/register', [RegisterController::class, 'create'])->name('register');
        Route::post('/register', [RegisterController::class, 'store'])->name('register.store');
    });

    // Buyer auth (authenticated)
    Route::middleware('auth:buyer')->group(function () {
        Route::post('/logout', [LogoutController::class, 'destroy'])->name('logout');
        Route::post('/become-creator', [BecomeCreatorController::class, 'store'])->name('become.creator');
        Route::get('/my-library', [MarketplaceLibraryController::class, 'index'])->name('library.index');
        Route::get('/my-library/{purchase}/read', [MarketplaceLibraryController::class, 'read'])->name('library.read');
        Route::get('/my-library/{purchase}', [MarketplaceLibraryController::class, 'show'])->name('library.show');
        Route::get('/account', [MarketplaceAccountController::class, 'edit'])->name('account.edit');
        Route::put('/account', [MarketplaceAccountController::class, 'update'])->name('account.update');
        Route::get('/purchase/callback', [MarketplacePurchaseController::class, 'callback'])->name('purchase.callback');
    });

    Route::get('/{business:slug}/{product:slug}', [MarketplaceController::class, 'product'])->name('product');
    Route::post('/{business:slug}/{product:slug}/buy', [MarketplacePurchaseController::class, 'store'])->name('buy');
});
