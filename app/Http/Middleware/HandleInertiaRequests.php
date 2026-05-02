<?php

namespace App\Http\Middleware;

use App\Auth\AuthIntent;
use App\Services\BusinessContext;
use App\Services\Subscription\DigitalStorageService;
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
                'activeGuard' => AuthIntent::guardForRoute($request),
                'user' => $request->user('web'),
                'customer' => BusinessContext::isSet() ? $request->user('customer') : null,
                'buyer' => $request->user('buyer'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            // All authenticated pages get the user's businesses list for the sidebar switcher
            'businesses' => fn () => $request->user('web')
                ? $request->user('web')->ownedBusinesses()->get(['id', 'name', 'slug'])->toArray()
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
                    'business_type' => $b->business_type,
                    'theme_id' => $b->theme_id,
                    'theme_settings' => $b->theme_settings,
                    'meta_pixel_id' => $b->meta_pixel_id,
                    'ai_enabled' => $b->ai_enabled,
                    'customer_login_mode' => $b->customer_login_mode,
                ];
            },
            // Subscription tier snapshot for the active business. Drives the
            // <TierLock> component, useTier() hook, and upgrade modal on
            // the frontend. See ANALYTICS_TIERS.md sections 1.1, 1.3, 7.3.
            //
            // The `tiers` map carries every tier's limits + flags so upsell
            // copy ("Upgrade to Pro for up to 8 photos") can stay config-
            // driven instead of hardcoded in components.
            'tier' => function () {
                if (! BusinessContext::isSet()) {
                    return null;
                }

                $b = BusinessContext::current();
                $tier = $b->subscription_tier;

                return [
                    'current' => $tier->value,
                    'rank' => $tier->rank(),
                    'label' => $tier->label(),
                    'features' => config('biizz.features'),
                    'limits' => $tier->limits(),
                    'flags' => $tier->flags(),
                    'tiers' => config('biizz.tiers'),
                    'currency' => config('biizz.currency'),
                    'expires_at' => $b->subscription_expires_at?->toIso8601String(),
                    'trial_ends_at' => $b->trial_ends_at?->toIso8601String(),
                    'subscription_status' => $b->subscription_status,
                    'current_period_end' => $b->current_period_end?->toIso8601String(),
                    'cancel_at_period_end' => $b->isCancelAtPeriodEnd(),
                ];
            },
            // Live snapshot of digital file storage usage. Drives the
            // pre-upload quota check in product file pickers and the usage
            // bar on admin pages. Sums ProductFile.file_size only, so the
            // query stays O(1) per request.
            'digitalStorage' => function () {
                if (! BusinessContext::isSet()) {
                    return null;
                }

                $b = BusinessContext::current();

                return [
                    'used_bytes' => DigitalStorageService::usedBytes($b),
                    'quota_bytes' => DigitalStorageService::quotaBytes($b),
                    'per_file_max_bytes' => DigitalStorageService::perFileMaxBytes($b),
                ];
            },
        ];
    }
}
