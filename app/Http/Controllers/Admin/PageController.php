<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePageRequest;
use App\Http\Requests\Admin\UpdatePageRequest;
use App\Models\Business;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(Business $business): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $pages = Page::withoutGlobalScopes()->where('business_id', $business->id)->orderBy('sort_order')->orderBy('title')->get();

        return Inertia::render('Admin/Pages/Index', [
            'business' => $business,
            'pages' => $pages,
        ]);
    }

    public function create(Business $business): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        return Inertia::render('Admin/Pages/Create', [
            'business' => $business,
        ]);
    }

    public function store(StorePageRequest $request, Business $business): RedirectResponse
    {
        $business->pages()->create($request->validated());

        return to_route('businesses.pages.index', $business)
            ->with('success', 'Page created.');
    }

    public function edit(Business $business, Page $page): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        return Inertia::render('Admin/Pages/Edit', [
            'business' => $business,
            'page' => $page,
        ]);
    }

    public function update(UpdatePageRequest $request, Business $business, Page $page): RedirectResponse
    {
        $page->update($request->validated());

        return to_route('businesses.pages.edit', [$business, $page])
            ->with('success', 'Page updated.');
    }

    public function destroy(Business $business, Page $page): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $page->delete();

        return to_route('businesses.pages.index', $business)
            ->with('success', 'Page deleted.');
    }

    public function togglePublish(Business $business, Page $page): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $page->update(['is_published' => ! $page->is_published]);

        return to_route('businesses.pages.edit', [$business, $page])
            ->with('success', $page->is_published ? 'Page published.' : 'Page unpublished.');
    }
}
