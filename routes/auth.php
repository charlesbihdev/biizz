<?php

use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\StorefrontAuth\GoogleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Social Authentication Routes
|--------------------------------------------------------------------------
| These routes handle Google OAuth via Laravel Socialite.
| Fortify owns /login and /register — these are additive.
|
*/

Route::middleware('guest')->group(function () {
    Route::get('/auth/google/redirect', [SocialiteController::class, 'redirect'])
        ->name('auth.google.redirect');

    Route::get('/auth/google/callback', [SocialiteController::class, 'callback'])
        ->name('auth.google.callback');
});

// Customer Google callback — fixed URL registered in Google Cloud Console.
// No business slug: the slug is restored from session (set before redirect).
Route::get('/auth/customer/google/callback', [GoogleController::class, 'callback'])
    ->name('customer.auth.google.callback');
