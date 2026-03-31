<?php

use App\Http\Controllers\CustomerAccountController;
use App\Http\Controllers\StorefrontAuth\GoogleController;
use App\Http\Controllers\StorefrontAuth\LoginController;
use App\Http\Controllers\StorefrontAuth\LogoutController;
use App\Http\Controllers\StorefrontAuth\RegisterController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Storefront Customer Auth Routes
|--------------------------------------------------------------------------
| All routes are scoped to a business via the 'business' middleware (set by
| the parent group in storefront.php). BusinessContext is available here.
|
*/

Route::post('/{business:slug}/auth/login', [LoginController::class, 'store'])
    ->name('customer.auth.login');

Route::post('/{business:slug}/auth/register', [RegisterController::class, 'store'])
    ->name('customer.auth.register');

Route::post('/{business:slug}/auth/logout', [LogoutController::class, 'destroy'])
    ->name('customer.auth.logout');

Route::get('/{business:slug}/auth/google', [GoogleController::class, 'redirect'])
    ->name('customer.auth.google');

// ── Customer account ───────────────────────────────────────────────────────────
// Auth is enforced in CustomerAccountController — using auth:customer as route
// middleware causes BusinessContext ordering issues (Authenticate is in the
// framework priority list, ResolveBusiness is not).

// /account redirects to /account/orders
Route::get('/{business:slug}/account', [CustomerAccountController::class, 'show'])
    ->name('customer.account');

// Section routes — each fetches only the data it needs
Route::get('/{business:slug}/account/orders', [CustomerAccountController::class, 'orders'])
    ->name('customer.account.orders');

Route::get('/{business:slug}/account/payments', [CustomerAccountController::class, 'payments'])
    ->name('customer.account.payments');

Route::get('/{business:slug}/account/addresses', [CustomerAccountController::class, 'addresses'])
    ->name('customer.account.addresses');

Route::get('/{business:slug}/account/profile', [CustomerAccountController::class, 'profile'])
    ->name('customer.account.profile');

// Mutation routes
Route::patch('/{business:slug}/account/profile', [CustomerAccountController::class, 'updateProfile'])
    ->name('customer.account.profile.update');

Route::post('/{business:slug}/account/addresses', [CustomerAccountController::class, 'storeAddress'])
    ->name('customer.account.addresses.store');

Route::delete('/{business:slug}/account/addresses/{address}', [CustomerAccountController::class, 'destroyAddress'])
    ->name('customer.account.addresses.destroy');

Route::post('/{business:slug}/account/orders/{order}/verify', [CustomerAccountController::class, 'verifyPayment'])
    ->name('customer.account.orders.verify');
