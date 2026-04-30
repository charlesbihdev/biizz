<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home')->name('home'); // resources/js/pages/home.tsx
Route::inertia('/privacy', 'privacy')->name('privacy');
Route::inertia('/terms', 'terms')->name('terms');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/storefront.php';
require __DIR__ . '/marketplace.php';
require __DIR__ . '/admin.php';
