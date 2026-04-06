<?php

use App\Http\Controllers\CreatorCatalogController;
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

Route::prefix('marketplace')->name('marketplace.')->group(function () {
    Route::get('/', [MarketplaceController::class, 'index'])->name('index');

    Route::middleware('auth')->group(function () {
        Route::get('/my-library', [MarketplaceLibraryController::class, 'index'])->name('library.index');
        Route::get('/my-library/{purchase}', [MarketplaceLibraryController::class, 'show'])->name('library.show');
    });

    Route::get('/{business:slug}/{product:slug}', [MarketplaceController::class, 'product'])->name('product');
    Route::post('/{business:slug}/{product:slug}/buy', [MarketplacePurchaseController::class, 'store'])->name('buy');
});
