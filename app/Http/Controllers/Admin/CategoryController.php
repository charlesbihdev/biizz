<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Category;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Business $business): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        return Inertia::render('Admin/Categories/Index', [
            'business' => $business,
            'categories' => $business->categories()->withCount('products')->get(),
        ]);
    }

    public function store(Request $request, Business $business): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $business->categories()->create($validated);

        return to_route('businesses.categories.index', $business)
            ->with('success', 'Category created.');
    }

    public function update(Request $request, Business $business, Category $category): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $category->update($validated);

        return to_route('businesses.categories.index', $business)
            ->with('success', 'Category updated.');
    }

    public function destroy(Business $business, Category $category): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        try {
            $category->delete();
        } catch (QueryException) {
            return to_route('businesses.categories.index', $business)
                ->with('error', 'Reassign or delete all products in this category first.');
        }

        return to_route('businesses.categories.index', $business)
            ->with('success', 'Category deleted.');
    }
}
