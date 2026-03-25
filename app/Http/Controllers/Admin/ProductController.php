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
    public function index(Business $business): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $products = Product::with(['category', 'images'])->latest()->paginate(20);

        return Inertia::render('Admin/Products/Index', [
            'business' => $business,
            'products' => $products,
        ]);
    }

    public function create(Business $business): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        return Inertia::render('Admin/Products/Create', [
            'business' => $business,
            'categories' => $business->categories()->get(['id', 'name']),
        ]);
    }

    public function store(StoreProductRequest $request, Business $business): RedirectResponse
    {
        $validated = $request->validated();
        $images = $validated['images'] ?? [];
        unset($validated['images']);

        $product = $business->products()->create($validated);

        foreach ($images as $i => $img) {
            $product->images()->create([
                'url' => $img['url'],
                'alt' => $img['alt'] ?? null,
                'sort_order' => $i,
            ]);
        }

        return to_route('businesses.products.index', $business)
            ->with('success', 'Product created.');
    }

    public function edit(Business $business, Product $product): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        return Inertia::render('Admin/Products/Edit', [
            'business' => $business,
            'product' => $product->load(['images', 'files']),
            'categories' => $business->categories()->get(['id', 'name']),
        ]);
    }

    public function update(UpdateProductRequest $request, Business $business, Product $product): RedirectResponse
    {
        $validated = $request->validated();
        $images = $validated['images'] ?? null;
        unset($validated['images']);

        $product->update($validated);

        if ($images !== null) {
            $product->images()->each(fn ($img) => $img->delete());
            foreach ($images as $i => $img) {
                $product->images()->create([
                    'url' => $img['url'],
                    'alt' => $img['alt'] ?? null,
                    'sort_order' => $i,
                ]);
            }
        }

        return back()->with('success', 'Product updated.');
    }

    public function destroy(Business $business, Product $product): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $product->delete();

        return to_route('businesses.products.index', $business)
            ->with('success', 'Product deleted.');
    }
}
