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
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => fn () => [
                'user' => $request->user(),
                'customer' => BusinessContext::isSet() ? $request->user('customer') : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            // All authenticated pages get the user's businesses list for the sidebar switcher
            'businesses' => fn () => $request->user()
                ? $request->user()->ownedBusinesses()->get(['id', 'name', 'slug'])->toArray()
                : [],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            // Only safe presentation fields — never payment keys.
            // Wrapped in a closure so it is resolved after the business route
            // middleware has set BusinessContext (share() runs before $next()).
            'business' => function () {
                if (! BusinessContext::isSet()) {
                    return null;
                }

                $b = BusinessContext::current();

                return [
                    'id' => $b->id,
                    'name' => $b->name,
                    'slug' => $b->slug,
                    'theme_id' => $b->theme_id,
                    'theme_settings' => $b->theme_settings,
                    'meta_pixel_id' => $b->meta_pixel_id,
                    'ai_enabled' => $b->ai_enabled,
                    'customer_login_mode' => $b->customer_login_mode,
                ];
            },
        ];
    }
}
