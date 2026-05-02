<?php

/*
|--------------------------------------------------------------------------
| biizz tier system
|--------------------------------------------------------------------------
|
| Source-of-truth for what each subscription tier unlocks. Code never
| references tier names directly: it goes through `FeatureAccess` and
| reads from this file via either the `features` map (feature key ->
| required tier) or the `tiers` map (per-tier limits and flags).
|
| Re-tiering = edit one line here. No code changes required.
|
| See ANALYTICS_TIERS.md sections 1.1 and 1.2 for the full contract.
|
*/

return [

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    |
    | Used by the pricing/billing pages. Tier prices below are denominated in
    | this currency. Phase 3 (Paystack subscriptions) consumes the same value.
    |
    */

    'currency' => 'GHS',

    /*
    |--------------------------------------------------------------------------
    | Tiers
    |--------------------------------------------------------------------------
    |
    | Per-tier numeric limits and boolean flags. `null` for a numeric limit
    | means unlimited. Limits are read via FeatureAccess::limit() and flags
    | via FeatureAccess::flag().
    |
    | `price` is the monthly amount in the configured currency. `tagline` is
    | the one-line outcome shown on /pricing (ANALYTICS_TIERS.md section 10).
    | `marketplace_fee_percent` is the platform cut taken from each digital
    | sale at the configured tier. The deduction itself is wired in Phase 3;
    | the rate is read from this file by both the pricing page and the
    | upgrade modal so it can be re-tiered without code changes.
    |
    */

    'tiers' => [

        'free' => [
            'rank' => 0,
            'label' => 'Free',
            'price' => 0,
            'tagline' => 'Run your business',
            'marketplace_fee_percent' => 7,
            'limits' => [
                'max_products' => 3,
                'max_product_images' => 1,
                'analytics_history_days' => 30,
                // Digital product file uploads. Per-file cap is the gate for
                // Free; total is a 50 MB safety net so the Free user never
                // realistically hits it. `null` per-file = no per-file limit.
                'max_digital_file_bytes' => 10 * 1024 * 1024,
                'max_digital_storage_bytes' => 50 * 1024 * 1024,
            ],
            'flags' => [
                // Free is forced-branded: the storefront footer always shows
                // "Powered by biizz". Phase 2 enforcement lives in the
                // settings form request via prepareForValidation().
                'storefront_branding_forced' => true,
            ],
        ],

        'pro' => [
            'rank' => 1,
            'label' => 'Pro',
            'price' => 69,
            'tagline' => 'Grow your business',
            'marketplace_fee_percent' => 5,
            'paystack_plan_code' => env('PAYSTACK_PLAN_PRO'),
            'limits' => [
                'max_products' => 20,
                'max_product_images' => 8,
                'analytics_history_days' => null,
                'max_digital_file_bytes' => null,
                'max_digital_storage_bytes' => 10 * 1024 * 1024 * 1024,
            ],
            'flags' => [
                'storefront_branding_forced' => false,
            ],
        ],

        'pro_max' => [
            'rank' => 2,
            'label' => 'Pro Max',
            'price' => 149,
            'tagline' => 'Scale across businesses',
            'marketplace_fee_percent' => 3,
            'paystack_plan_code' => env('PAYSTACK_PLAN_PRO_MAX'),
            'limits' => [
                'max_products' => 50,
                'max_product_images' => 20,
                'analytics_history_days' => null,
                'max_digital_file_bytes' => null,
                'max_digital_storage_bytes' => 50 * 1024 * 1024 * 1024,
            ],
            'flags' => [
                'storefront_branding_forced' => false,
            ],
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Features
    |--------------------------------------------------------------------------
    |
    | Each feature is a small map: `min_tier` is the minimum tier required
    | to access it; `audience` is the business type the feature applies to
    | (`physical`, `digital`, or `all`). Audience drives what bullets show
    | up in the in-app upgrade modal so a digital business never sees a
    | storefront-branding line and a physical business never sees a digital
    | storage line.
    |
    | To re-tier or re-audience a feature, edit one entry. Never hardcode
    | tier or audience names elsewhere.
    |
    | Unknown feature keys throw at runtime by design.
    |
    */

    'features' => [

        // Catalog (applies to both physical and digital businesses)
        'products.unlimited' => ['min_tier' => 'pro', 'audience' => 'all'],
        'products.multiple_images' => ['min_tier' => 'pro', 'audience' => 'all'],

        // Physical-only: digital businesses list on the universal marketplace
        // and have no storefront of their own.
        'storefront.no_branding' => ['min_tier' => 'pro', 'audience' => 'physical'],

        // Digital-only: physical businesses sell tangible goods and have no
        // file storage budget to consume.
        'storage.larger_digital_files' => ['min_tier' => 'pro', 'audience' => 'digital'],
        'storage.more_digital_storage' => ['min_tier' => 'pro', 'audience' => 'digital'],

        // Analytics - operational (Free, both audiences)
        'analytics.overview' => ['min_tier' => 'free', 'audience' => 'all'],

        // Analytics - insight (Pro, both audiences)
        'analytics.revenue_chart' => ['min_tier' => 'pro', 'audience' => 'all'],
        'analytics.compare_periods' => ['min_tier' => 'pro', 'audience' => 'all'],
        'analytics.aov' => ['min_tier' => 'pro', 'audience' => 'all'],
        'analytics.refund_rate' => ['min_tier' => 'pro', 'audience' => 'all'],
        'analytics.heatmap' => ['min_tier' => 'pro', 'audience' => 'all'],
        'analytics.top_products' => ['min_tier' => 'pro', 'audience' => 'all'],
        'analytics.top_categories' => ['min_tier' => 'pro', 'audience' => 'all'],
        'analytics.stock_velocity' => ['min_tier' => 'pro', 'audience' => 'physical'],
        'analytics.product_drilldown' => ['min_tier' => 'pro', 'audience' => 'all'],
        'analytics.repeat_rate' => ['min_tier' => 'pro', 'audience' => 'all'],
        'analytics.new_vs_returning' => ['min_tier' => 'pro', 'audience' => 'all'],
        'analytics.top_customers' => ['min_tier' => 'pro', 'audience' => 'all'],
        'analytics.customer_drilldown' => ['min_tier' => 'pro', 'audience' => 'all'],
        'analytics.channel_mix' => ['min_tier' => 'pro', 'audience' => 'all'],
        'analytics.gateway_health' => ['min_tier' => 'pro', 'audience' => 'all'],

        // Analytics - intelligence (Pro Max)
        'analytics.export_csv' => ['min_tier' => 'pro_max', 'audience' => 'all'],
        'analytics.email_digest' => ['min_tier' => 'pro_max', 'audience' => 'all'],
        'analytics.custom_compare' => ['min_tier' => 'pro_max', 'audience' => 'all'],
        'analytics.saved_views' => ['min_tier' => 'pro_max', 'audience' => 'all'],
        'analytics.rfm' => ['min_tier' => 'pro_max', 'audience' => 'all'],
        'analytics.cohort_retention' => ['min_tier' => 'pro_max', 'audience' => 'all'],
        'analytics.stockout_forecast' => ['min_tier' => 'pro_max', 'audience' => 'physical'],
        'analytics.goals' => ['min_tier' => 'pro_max', 'audience' => 'all'],
        'analytics.multi_business' => ['min_tier' => 'pro_max', 'audience' => 'all'],
        'analytics.threshold_alerts' => ['min_tier' => 'pro_max', 'audience' => 'all'],

    ],

    /*
    |--------------------------------------------------------------------------
    | Subscription lifecycle
    |--------------------------------------------------------------------------
    |
    | Tunables for the lapse and renewal-reminder commands. Read by
    | App\Console\Commands\ExpireSubscriptionsCommand and
    | App\Console\Commands\DispatchSubscriptionRenewalRemindersCommand
    | so neither has magic numbers baked in.
    |
    | `lapse_grace_days`: how many days AFTER current_period_end the lapse
    | command waits before downgrading to Free. Stops same-day races between
    | webhook and cron.
    |
    | `manual_renewal_reminder_days_before_end`: days BEFORE
    | current_period_end at which manual subscribers get a renewal email.
    |
    */

    'subscription' => [
        'lapse_grace_days' => (int) env('BIIZZ_SUBSCRIPTION_LAPSE_GRACE_DAYS', 3),
        'manual_renewal_reminder_days_before_end' => (int) env(
            'BIIZZ_SUBSCRIPTION_REMINDER_DAYS_BEFORE_END',
            3,
        ),
    ],

];
