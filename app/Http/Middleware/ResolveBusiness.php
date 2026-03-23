<?php

namespace App\Http\Middleware;

use App\Models\Business;
use App\Services\BusinessContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolves the active Business from the URL and sets it on BusinessContext.
 *
 * This middleware is the gate to all business-scoped routes.
 * If the business cannot be resolved, the request is hard-rejected with 403.
 * No fallback. No default business. No silent failure.
 *
 * Apply with: Route::middleware('business')
 */
class ResolveBusiness
{
    public function handle(Request $request, Closure $next): Response
    {
        $business = $request->route('business');

        if (! $business instanceof Business) {
            abort(403, 'Business context could not be resolved.');
        }

        BusinessContext::set($business);

        return $next($request);
    }
}
