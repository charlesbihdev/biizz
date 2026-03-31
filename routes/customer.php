<?php

use App\Http\Controllers\CustomerAccountController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Customer Account Routes
|--------------------------------------------------------------------------
| All account management routes — orders, payments, addresses, profile.
| Auth is enforced in CustomerAccountController (not via route middleware)
| to avoid BusinessContext ordering issues with the Authenticate middleware.
| All routes are scoped to a business via the parent group in storefront.php.
|
*/

// /account redirects to /account/orders
Route::get('/{business:slug}/account', [CustomerAccountController::class, 'show'])
    ->name('customer.account');

Route::get('/{business:slug}/account/orders', [CustomerAccountController::class, 'orders'])
    ->name('customer.account.orders');

Route::get('/{business:slug}/account/orders/{order:order_id}', [CustomerAccountController::class, 'showOrder'])
    ->name('customer.account.orders.show');

Route::get('/{business:slug}/account/payments', [CustomerAccountController::class, 'payments'])
    ->name('customer.account.payments');

Route::get('/{business:slug}/account/payments/{order:payment_ref}', [CustomerAccountController::class, 'showPayment'])
    ->name('customer.account.payments.show');

Route::get('/{business:slug}/account/addresses', [CustomerAccountController::class, 'addresses'])
    ->name('customer.account.addresses');

Route::get('/{business:slug}/account/profile', [CustomerAccountController::class, 'profile'])
    ->name('customer.account.profile');

// Mutation routes
Route::patch('/{business:slug}/account/profile', [CustomerAccountController::class, 'updateProfile'])
    ->name('customer.account.profile.update');

Route::post('/{business:slug}/account/addresses', [CustomerAccountController::class, 'storeAddress'])
    ->name('customer.account.addresses.store');

Route::patch('/{business:slug}/account/addresses/{address}', [CustomerAccountController::class, 'updateAddress'])
    ->name('customer.account.addresses.update');

Route::delete('/{business:slug}/account/addresses/{address}', [CustomerAccountController::class, 'destroyAddress'])
    ->name('customer.account.addresses.destroy');

Route::post('/{business:slug}/account/orders/{order}/verify', [CustomerAccountController::class, 'verifyPayment'])
    ->name('customer.account.orders.verify');
