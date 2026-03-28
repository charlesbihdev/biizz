<?php

namespace App\Http\Middleware;

use App\Services\BusinessContext;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $business = BusinessContext::isSet() ? BusinessContext::current() : null;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            // All authenticated pages get the user's businesses list for the sidebar switcher
            'businesses' => $request->user()
                ? $request->user()->ownedBusinesses()->get(['id', 'name', 'slug'])->toArray()
                : [],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'warning' => fn() => $request->session()->get('warning'),
            ],
            // Only safe presentation fields — never payment keys.
            'business' => $business ? [
                'id' => $business->id,
                'name' => $business->name,
                'slug' => $business->slug,
                'theme_id' => $business->theme_id,
                'theme_settings' => $business->theme_settings,
                'meta_pixel_id' => $business->meta_pixel_id,
                'ai_enabled' => $business->ai_enabled,
            ] : null,
        ];
    }
}
