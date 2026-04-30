<?php

namespace Tests;

use App\Services\BusinessContext;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    protected function tearDown(): void
    {
        // BusinessContext is a process-level static singleton. Without this
        // clear, a storefront test leaves the context set and the next test
        // inherits it, which (for example) makes /dashboard look like a
        // customer route to AuthIntent::guardForRoute.
        BusinessContext::clear();

        parent::tearDown();
    }

    protected function skipUnlessFortifyFeature(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
