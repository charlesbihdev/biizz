<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Http\Request;
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

        $categorySlug = request()->query('category');
        $category = $categorySlug
            ? $business->categories()->where('slug', $categorySlug)->first()
            : null;

        $products = $business->products()
            ->active()
            ->inStock()
            ->when($category, fn ($q) => $q->where('category_id', $category->id))
            ->with(['category', 'images'])
            ->paginate($perPage)
            ->withQueryString();

        $business->load([
            'categories' => fn ($q) => $q->orderBy('sort_order'),
            'pages' => fn ($q) => $q->published(),
        ]);

        return Inertia::render('Storefront/Main', [
            'business' => $business,
            'products' => $products,
            'pages' => $business->pages,
        ]);
    }

    /**
     * Render the dedicated shop/catalog page with advanced filtering.
     */
    public function shop(Business $business): Response
    {
        abort_unless($business->is_active && ($business->theme_settings['show_shop_page'] ?? true), 404);

        $perPage = (int) ($business->theme_settings['products_per_page'] ?? 24);
        $category = null;

        if ($categorySlug = request()->query('category')) {
            $category = $business->categories()->where('slug', $categorySlug)->first();
        }

        $sort = request()->query('sort', 'newest');
        $inStock = request()->boolean('in_stock', false);

        $products = $business->products()
            ->active()
            ->when($category, fn ($q) => $q->where('category_id', $category->id))
            ->when($inStock, fn ($q) => $q->inStock())
            ->when(request('min_price'), fn ($q) => $q->where('price', '>=', request('min_price')))
            ->when(request('max_price'), fn ($q) => $q->where('price', '<=', request('max_price')))
            ->when(request('q'), fn ($q) => $q->where('name', 'like', '%'.request('q').'%'))
            ->when(true, fn ($q) => match ($sort) {
                'price_asc' => $q->orderBy('price'),
                'price_desc' => $q->orderByDesc('price'),
                'name_asc' => $q->orderBy('name'),
                default => $q->latest(),
            })
            ->with(['category', 'images'])
            ->paginate($perPage)
            ->withQueryString();

        $priceRange = [
            'min' => (float) ($business->products()->active()->min('price') ?? 0),
            'max' => (float) ($business->products()->active()->max('price') ?? 0),
        ];

        $business->load([
            'categories' => fn ($q) => $q->orderBy('sort_order'),
            'pages' => fn ($q) => $q->published(),
        ]);

        return Inertia::render('Storefront/Shop', [
            'business' => $business,
            'products' => $products,
            'pages' => $business->pages,
            'priceRange' => $priceRange,
            'filters' => [
                'category' => request()->query('category'),
                'min_price' => request()->query('min_price'),
                'max_price' => request()->query('max_price'),
                'in_stock' => $inStock,
                'sort' => $sort,
                'q' => request()->query('q'),
            ],
        ]);
    }

    /**
     * Render a preview of the storefront with unsaved theme settings merged in.
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

        $business->load([
            'categories' => fn ($q) => $q->orderBy('sort_order'),
            'pages' => fn ($q) => $q->published(),
        ]);

        return Inertia::render('Storefront/Main', [
            'business' => $business,
            'products' => $products,
            'pages' => $business->pages,
            'isPreview' => true,
        ]);
    }

    /**
     * Render the product detail page.
     */
    public function product(Business $business, Product $product): Response
    {
        abort_unless($business->is_active && $product->is_active, 404);

        $product->load(['images', 'files', 'category']);

        $related = $business->products()
            ->active()
            ->inStock()
            ->when($product->category_id, fn ($q) => $q->where('category_id', $product->category_id))
            ->where('id', '!=', $product->id)
            ->with('images')
            ->limit(4)
            ->get();

        $business->load(['pages' => fn ($q) => $q->published()]);

        return Inertia::render('Storefront/Product', [
            'business' => $business,
            'product' => $product,
            'related' => $related,
            'pages' => $business->pages,
        ]);
    }

    /**
     * Render the checkout page.
     * Cart state lives client-side (Zustand/localStorage) — no cart data is passed from the server.
     */
    public function checkout(Business $business): Response
    {
        abort_unless($business->is_active, 404);

        $business->load(['pages' => fn ($q) => $q->published()]);

        return Inertia::render('Storefront/Checkout', [
            'business' => $business,
            'pages' => $business->pages,
        ]);
    }

    /**
     * Render the auto-generated contact page.
     */
    public function contact(Business $business): Response
    {
        abort_unless($business->is_active, 404);

        $business->load(['pages' => fn ($q) => $q->published()]);

        return Inertia::render('Storefront/Contact', [
            'business' => $business,
            'pages' => $business->pages,
        ]);
    }

    /**
     * Render a custom page (published, or draft when previewed by the owner).
     */
    public function page(Request $request, Business $business, Page $page): Response
    {
        $isPreview = $request->boolean('preview')
            && $request->user()
            && $request->user()->businesses()->where('businesses.id', $business->id)->exists();

        abort_unless($business->is_active && ($page->is_published || $isPreview), 404);

        $business->load(['pages' => fn ($q) => $q->published()]);

        return Inertia::render('Storefront/Page', [
            'business' => $business,
            'page' => $page,
            'pages' => $business->pages,
            'isPreview' => $isPreview,
        ]);
    }
}
