<?php

namespace App\Http\Middleware;

use App\Models\Business;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Rejects with 403 if the authenticated user does not own the resolved business.
 *
 * Must run AFTER ResolveBusiness. Apply on admin routes that should never be
 * reachable by anyone other than the business owner.
 *
 * Apply with: Route::middleware(['business', 'business.owner'])
 */
class EnsureBusinessOwner
{
    public function handle(Request $request, Closure $next): Response
    {
        $business = $request->route('business');
        $user = $request->user();

        if (! $business instanceof Business || ! $user || ! $business->isOwnedBy($user)) {
            abort(403);
        }

        return $next($request);
    }
}
