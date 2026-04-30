<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Runs Laravel's password.confirm gate only for users who actually have a
 * password. OAuth-only accounts (e.g. Google sign-in) pass through, since
 * they cannot satisfy the confirm-password form.
 */
class ConfirmPasswordIfSet
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (blank($request->user()?->password)) {
            return $next($request);
        }

        return app(RequirePassword::class)->handle($request, $next);
    }
}
