<?php

namespace App\Http\Controllers;

use App\Models\Business;
use Inertia\Inertia;
use Inertia\Response;

class CreatorCatalogController extends Controller
{
    public function show(Business $business): Response
    {
        abort_unless($business->is_active && $business->business_type === 'digital', 404);

        $products = $business->products()
            ->active()
            ->with('images')
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Marketplace/CreatorCatalog', [
            'business' => $business,
            'products' => $products,
        ]);
    }
}
