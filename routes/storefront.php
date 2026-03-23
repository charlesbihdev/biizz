<?php

use App\Http\Controllers\StorefrontController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Storefront Routes (Public)
|--------------------------------------------------------------------------
| URL structure: /s/{business:slug}
|
| The 'business' middleware resolves the Business model from the slug and
| sets BusinessContext. 403 is returned if the slug does not exist.
|
| Production: these routes will be served from {slug}.biizz.app via
| subdomain routing. The subdirectory pattern (/s/{slug}) is for local dev.
|
*/

Route::prefix('s')->group(function () {
    Route::middleware('business')->group(function () {
        Route::get('/{business:slug}', [StorefrontController::class, 'show'])
            ->name('storefront.show');

        Route::get('/{business:slug}/preview', [StorefrontController::class, 'preview'])
            ->name('storefront.preview');
    });
});
