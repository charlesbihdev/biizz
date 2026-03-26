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

use Illuminate\Support\Facades\Storage;

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
        $data = $request->validated();

        if ($request->hasFile('images')) {
            $data['content'] = $this->processTiptapImages($data['content'] ?? '', $request->file('images'), $business);
        }

        unset($data['images']);
        $business->pages()->create($data);

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
        $data = $request->validated();

        if ($request->hasFile('images')) {
            $data['content'] = $this->processTiptapImages($data['content'] ?? '', $request->file('images'), $business);
        }

        unset($data['images']);
        $page->update($data);

        return to_route('businesses.pages.edit', [$business, $page])
            ->with('success', 'Page updated.');
    }

    /**
     * Process Tiptap images by uploading them to S3 and replacing placeholders in the content.
     */
    private function processTiptapImages(string $content, array $images, Business $business): string
    {
        foreach ($images as $index => $file) {
            $path = $file->storePublicly("businesses/{$business->id}", 's3');
            $url = Storage::disk('s3')->url($path);
            
            $placeholder = "__IMAGE_ID_{$index}__";
            $content = str_replace($placeholder, $url, $content);
        }

        return $content;
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
