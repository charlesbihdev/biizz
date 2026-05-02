<?php

namespace App\Http\Middleware;

use App\Services\BusinessContext;
use App\Services\Subscription\FeatureAccess;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Aborts with 402 (Payment Required) if the resolved business cannot access
 * the named feature. Must run AFTER ResolveBusiness so BusinessContext is set.
 *
 * Apply with: Route::middleware(['business', 'business.owner', 'feature:analytics.compare_periods'])
 */
class EnsureFeatureAccess
{
    public function handle(Request $request, Closure $next, string $featureKey): Response
    {
        if (! BusinessContext::isSet()) {
            abort(403, 'Business context not resolved.');
        }

        $business = BusinessContext::current();

        abort_unless(
            FeatureAccess::check($business, $featureKey),
            402,
            "Upgrade required: {$featureKey}"
        );

        return $next($request);
    }
}
