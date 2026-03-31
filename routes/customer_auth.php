<?php

use App\Http\Controllers\StorefrontAuth\GoogleController;
use App\Http\Controllers\StorefrontAuth\LoginController;
use App\Http\Controllers\StorefrontAuth\LogoutController;
use App\Http\Controllers\StorefrontAuth\RegisterController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Storefront Customer Auth Routes
|--------------------------------------------------------------------------
| Authentication actions (login, register, logout, OAuth).
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
