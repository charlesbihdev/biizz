<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    /**
     * Render the live storefront for a business.
     * Products are paginated based on the business's theme setting.
     */
    public function show(Business $business): Response|RedirectResponse
    {
        abort_unless($business->is_active, 404);

        // Digital businesses live at /catalog/{slug}, not on the themed storefront.
        if ($business->business_type === 'digital') {
            return redirect()->route('catalog.show', $business->slug);
        }

        $business->load(['pages' => fn ($q) => $q->published()]);

        // Course Funnel loads only what the page actually needs.
        if ($business->theme_id === 'course-funnel') {
            return $this->showCourseFunnel($business);
        }

        // Classic, Boutique, and future themes: full paginated product list.
        $perPage = (int) ($business->theme_settings['products_per_page'] ?? 24);

        $categorySlug = request()->query('category');
        $category = $categorySlug
            ? $business->categories()->where('slug', $categorySlug)->first()
            : null;

        $business->load(['categories' => fn ($q) => $q->orderBy('sort_order')]);

        $products = $business->products()
            ->active()
            ->inStock()
            ->when($category, fn ($q) => $q->where('category_id', $category->id))
            ->with(['category', 'images'])
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Storefront/Main', [
            'business' => $business,
            'products' => $products,
            'pages' => $business->pages,
        ]);
    }

    /**
     * Homepage for the Course Funnel theme.
     * catalog_mode OFF: only the one featured product is loaded.
     * catalog_mode ON:  paginated product list for the catalog grid.
     */
    private function showCourseFunnel(Business $business): Response
    {
        $catalogMode = (bool) ($business->theme_settings['catalog_mode'] ?? false);

        if ($catalogMode) {
            $perPage = (int) ($business->theme_settings['products_per_page'] ?? 12);

            $products = $business->products()
                ->active()
                ->with('images')
                ->latest()
                ->paginate($perPage)
                ->withQueryString();

            return Inertia::render('Storefront/Main', [
                'business' => $business,
                'products' => $products,
                'pages' => $business->pages,
            ]);
        }

        // Single-product funnel: fetch only the featured product.
        $featuredId = $business->theme_settings['featured_product_id'] ?? null;

        $featuredProduct = $featuredId
            ? $business->products()->active()->with('images')->find($featuredId)
            : $business->products()->active()->with('images')->latest()->first();

        return Inertia::render('Storefront/Main', [
            'business' => $business,
            'featured_product' => $featuredProduct,
            'pages' => $business->pages,
        ]);
    }

    /**
     * Render the dedicated shop/catalog page with advanced filtering.
     */
    public function shop(Business $business): Response
    {
        $shopEnabled = $business->theme_id === 'course-funnel'
            ? ($business->theme_settings['catalog_mode'] ?? false)
            : ($business->theme_settings['show_shop_page'] ?? true);

        abort_unless($business->is_active && $shopEnabled, 404);

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
                'primary_color',
                'highlight_color',
                'surface_color',
                'color_scheme',
                'hero_image',
                'logo_url',
                'show_featured',
                'show_testimonials',
                'show_hero',
                'store_tagline',
                'layout_style',
                'products_per_page',
                'store_description',
                'store_address',
                'whatsapp_number',
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

        $customer = auth('customer')->user();

        return Inertia::render('Storefront/Checkout', [
            'business' => $business,
            'pages' => $business->pages,
            'hasPaystack' => $business->hasPaystackConfigured(),
            'hasJunipay' => $business->hasJunipayConfigured(),
            'addresses' => $customer ? $customer->addresses()->get() : [],
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
