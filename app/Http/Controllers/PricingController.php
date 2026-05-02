<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

/**
 * The /pricing page is the closer. Three columns, anchored Pro Max,
 * outcome-row first, FAQ block. See ANALYTICS_TIERS.md section 10.
 *
 * Reads tier metadata from `config/biizz.php`. Re-pricing is a one-line
 * config edit (the file lives next to the limit/flag definitions so it
 * stays cohesive).
 */
class PricingController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Pricing/Index', [
            'currency' => config('biizz.currency'),
            'tiers' => config('biizz.tiers'),
            'features' => config('biizz.features'),
        ]);
    }
}
