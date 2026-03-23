<?php

namespace App\Http\Controllers;

use App\Models\Business;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    /**
     * Render the live storefront for a business.
     * Eagerly loads products to avoid N+1 on theme components.
     */
    public function show(Business $business): Response
    {
        $business->load(['products' => fn ($q) => $q->active()->inStock()]);

        return Inertia::render('Storefront/Main', [
            'business' => $business,
        ]);
    }

    /**
     * Render a preview of the storefront with unsaved theme settings merged in.
     *
     * The Admin Dashboard sends current (unsaved) settings as query params.
     * We merge them into theme_settings without persisting — pure preview.
     */
    public function preview(Business $business): Response
    {
        $overrides = request()->only(array_keys($business->theme_settings ?? []));

        $business->theme_settings = array_merge(
            $business->theme_settings ?? [],
            $overrides
        );

        $business->load(['products' => fn ($q) => $q->active()]);

        return Inertia::render('Storefront/Main', [
            'business'   => $business,
            'isPreview'  => true,
        ]);
    }
}
