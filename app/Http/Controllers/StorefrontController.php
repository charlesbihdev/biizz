<?php

namespace App\Http\Controllers;

use App\Models\Business;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    /**
     * Render the live storefront for a business.
     * Products are paginated based on the business's theme setting.
     */
    public function show(Business $business): Response
    {
        abort_unless($business->is_active, 404);

        $perPage = (int) ($business->theme_settings['products_per_page'] ?? 24);

        $categoryId = request()->query('category');

        $products = $business->products()
            ->active()
            ->inStock()
            ->when($categoryId, fn ($q) => $q->where('category_id', $categoryId))
            ->with(['category', 'images'])
            ->paginate($perPage)
            ->withQueryString();

        $business->load(['categories' => fn ($q) => $q->orderBy('sort_order')]);

        return Inertia::render('Storefront/Main', [
            'business' => $business,
            'products' => $products,
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
        $knownKeys = array_keys(array_merge(
            $business->theme_settings ?? [],
            [
                'primary_color', 'accent_color', 'color_scheme', 'hero_image', 'logo_url',
                'show_featured', 'show_testimonials', 'show_hero', 'store_tagline',
                'layout_style', 'products_per_page', 'store_description',
                'store_address', 'whatsapp_number',
            ]
        ));

        $overrides = request()->only($knownKeys);

        $business->theme_settings = array_merge(
            $business->theme_settings ?? [],
            $overrides
        );

        $perPage = (int) ($business->theme_settings['products_per_page'] ?? 24);

        $products = $business->products()
            ->active()
            ->with(['category', 'images'])
            ->paginate($perPage)
            ->withQueryString();

        $business->load(['categories' => fn ($q) => $q->orderBy('sort_order')]);

        return Inertia::render('Storefront/Main', [
            'business' => $business,
            'products' => $products,
            'isPreview' => true,
        ]);
    }
}
