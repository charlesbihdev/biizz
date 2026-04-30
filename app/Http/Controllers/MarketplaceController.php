<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // @phpstan-ignore-line
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::withoutGlobalScopes()
            ->whereHas('business', fn ($q) => $q->where('business_type', 'digital')->where('is_active', true))
            ->where('is_active', true)
            ->with(['business:id,name,slug,logo_url', 'images']);

        $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(fn ($q) => $q
                ->where('name', $like, "%{$search}%")
                ->orWhere('description', $like, "%{$search}%")
            );
        }

        if ($request->filled('category')) {
            $query->where('digital_category', $request->string('category'));
        }

        if ($request->filled('tag')) {
            $tag = (string) $request->string('tag');

            if (DB::getDriverName() === 'pgsql') {
                $query->whereJsonContains('tags', $tag);
            } else {
                $query->where('tags', 'like', '%"'.$tag.'"%');
            }
        }

        $products = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Marketplace/Index', [
            'products' => $products,
            'activeFilters' => $request->only(['search', 'category', 'tag']),
        ]);
    }

    public function product(Business $business, Product $product): Response
    {
        abort_unless($business->business_type === 'digital' && $business->is_active, 404);
        abort_unless($product->is_active && $product->business_id === $business->id, 404);

        $product->load(['images', 'business:id,name,slug,logo_url,description']);

        $related = Product::withoutGlobalScopes()
            ->where('business_id', $business->id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->with(['images'])
            ->inRandomOrder()
            ->limit(3)
            ->get();

        return Inertia::render('Marketplace/Product', [
            'product' => $product,
            'related' => $related,
        ]);
    }
}
