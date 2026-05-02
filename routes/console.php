<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Daily 09:00 UTC: downgrade businesses whose paid plan has lapsed past
// the configured grace window, and email manual subscribers whose period
// is approaching its end. Both commands are idempotent for the cadence.
Schedule::command('subscription:expire')->dailyAt('09:00');
Schedule::command('subscription:remind')->dailyAt('09:00');
