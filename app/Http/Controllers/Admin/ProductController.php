<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Business;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * List all products for the active business.
     * BusinessScope automatically scopes the query.
     */
    public function index(Business $business): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $products = Product::with('category')->latest()->paginate(20);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'business' => $business,
            'categories' => $business->categories()->get(['id', 'name']),
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(Business $business): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        return Inertia::render('Admin/Products/Create', [
            'business' => $business,
        ]);
    }

    /**
     * Store a new product, scoped to the active business.
     */
    public function store(StoreProductRequest $request, Business $business): RedirectResponse
    {
        $business->products()->create($request->validated());

        return to_route('businesses.products.index', $business)
            ->with('success', 'Product created.');
    }

    /**
     * Show the form for editing a product.
     */
    public function edit(Business $business, Product $product): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        return Inertia::render('Admin/Products/Edit', [
            'business' => $business,
            'product' => $product,
            'categories' => $business->categories()->get(['id', 'name']),
        ]);
    }

    /**
     * Update a product.
     */
    public function update(UpdateProductRequest $request, Business $business, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        return back()->with('success', 'Product updated.');
    }

    /**
     * Delete a product.
     * Will fail if the product has been ordered (restrictOnDelete) — by design.
     * Use deactivation (is_active = false) to hide products from storefront instead.
     */
    public function destroy(Business $business, Product $product): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $product->delete();

        return to_route('businesses.products.index', $business)
            ->with('success', 'Product deleted.');
    }
}
