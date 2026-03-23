<?php

namespace App\Services;

use App\Models\Business;
use RuntimeException;

/**
 * Request-scoped singleton that holds the active Business for the current HTTP request.
 *
 * Usage:
 *   BusinessContext::set($business);   // Called once by ResolveBusiness middleware
 *   BusinessContext::current();        // Called by BusinessScope on every query
 *   BusinessContext::isSet();          // Guard for seeders / artisan commands
 *   BusinessContext::clear();          // Called in test tearDown()
 *
 * Design mirrors Laravel's Auth::user() — accessible anywhere without DI.
 * Safe in PHP-FPM / Herd: one process = one request = one static value.
 */
final class BusinessContext
{
    private static ?Business $current = null;

    public static function set(Business $business): void
    {
        self::$current = $business;
    }

    /**
     * @throws RuntimeException if middleware has not set the context
     */
    public static function current(): Business
    {
        if (self::$current === null) {
            throw new RuntimeException(
                'BusinessContext has not been set for this request. '
                . 'Ensure the ResolveBusiness middleware is applied to this route.'
            );
        }

        return self::$current;
    }

    public static function isSet(): bool
    {
        return self::$current !== null;
    }

    /**
     * Clear the context — must be called in test tearDown() to prevent bleed between tests.
     */
    public static function clear(): void
    {
        self::$current = null;
    }
}
