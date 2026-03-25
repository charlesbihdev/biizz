<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Business;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
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
        unset($validated['images']);

        $product = $business->products()->create($validated);

        $this->syncImages($request, $product, $business);

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
        $hasImages = $request->has('images');
        unset($validated['images']);

        $product->update($validated);

        if ($hasImages) {
            $product->images()->each(fn ($img) => $img->delete());
            $this->syncImages($request, $product, $business);
        }

        return to_route('businesses.products.edit', [$business, $product])
            ->with('success', 'Product updated.');
    }

    private function syncImages(StoreProductRequest|UpdateProductRequest $request, Product $product, Business $business): void
    {
        $count = is_array($request->input('images')) ? count($request->input('images')) : 0;

        for ($i = 0; $i < $count; $i++) {
            if ($request->hasFile("images.$i.file")) {
                $path = $request->file("images.$i.file")->storePublicly("businesses/{$business->id}", 's3');
                $url  = Storage::disk('s3')->url($path);
            } else {
                $url = $request->input("images.$i.url");
                if (!$url || str_starts_with($url, 'blob:')) {
                    continue;
                }
            }

            $product->images()->create([
                'url'        => $url,
                'alt'        => $request->input("images.$i.alt"),
                'sort_order' => $i,
            ]);
        }
    }

    public function destroy(Business $business, Product $product): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $product->delete();

        return to_route('businesses.products.index', $business)
            ->with('success', 'Product deleted.');
    }
}
