<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $businesses = auth()->user()
            ->ownedBusinesses()
            ->withCount('products', 'orders')
            ->latest()
            ->get();

        return Inertia::render('dashboard', ['businesses' => $businesses]);
    }
}
