<?php

namespace App\Console\Commands;

use App\Enums\SubscriptionTier;
use App\Services\Subscription\PlanCatalog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

/**
 * One-shot helper that creates (or refreshes) one Paystack Plan per
 * billable tier. Run this whenever you change a tier price or the
 * Paystack secret. Prints the plan codes so you can drop them into
 * `.env` (PAYSTACK_PLAN_PRO, PAYSTACK_PLAN_PRO_MAX) when bootstrapping a
 * fresh environment.
 */
class SyncPaystackPlansCommand extends Command
{
    protected $signature = 'paystack:sync-plans {--interval=monthly}';

    protected $description = 'Create or update Paystack Plans for each billable tier and print their plan codes.';

    public function handle(): int
    {
        $secret = (string) config('services.paystack.secret');
        if ($secret === '') {
            $this->error('PAYSTACK_SECRET_KEY is not set. Aborting.');

            return self::FAILURE;
        }

        $interval = (string) $this->option('interval');
        $base = rtrim((string) config('services.paystack.url', 'https://api.paystack.co'), '/');

        $rows = [];

        foreach (PlanCatalog::paid() as $tier) {
            $price = PlanCatalog::priceFor($tier);
            $existing = PlanCatalog::paystackPlanCodeFor($tier);
            $code = $existing
                ? $this->updatePlan($base, $secret, $existing, $tier, $price, $interval)
                : $this->createPlan($base, $secret, $tier, $price, $interval);

            $rows[] = [
                $tier->value,
                $tier->label(),
                PlanCatalog::currency().' '.$price,
                $code ?? 'failed',
                $existing ? 'updated' : 'created',
            ];
        }

        $this->newLine();
        $this->table(['Tier', 'Label', 'Price', 'Plan Code', 'Action'], $rows);

        $this->newLine();
        $this->line('Add these to your .env (no quotes):');
        foreach ($rows as [$tierValue, , , $code]) {
            $envKey = 'PAYSTACK_PLAN_'.strtoupper($tierValue);
            $this->line("  {$envKey}={$code}");
        }

        return self::SUCCESS;
    }

    private function createPlan(string $base, string $secret, SubscriptionTier $tier, int $price, string $interval): ?string
    {
        $response = Http::withToken($secret)->post($base.'/plan', [
            'name' => 'biizz '.$tier->label(),
            'amount' => $price * 100,
            'interval' => $interval,
            'currency' => PlanCatalog::currency(),
            'description' => 'biizz '.$tier->label().' subscription',
            'send_invoices' => true,
            'send_sms' => false,
        ]);

        if (! $response->successful()) {
            $this->warn("Paystack rejected create for {$tier->value}: ".$response->body());

            return null;
        }

        return $response->json('data.plan_code');
    }

    private function updatePlan(string $base, string $secret, string $code, SubscriptionTier $tier, int $price, string $interval): ?string
    {
        $response = Http::withToken($secret)->put($base.'/plan/'.$code, [
            'name' => 'biizz '.$tier->label(),
            'amount' => $price * 100,
            'interval' => $interval,
            'currency' => PlanCatalog::currency(),
            'send_invoices' => true,
            'send_sms' => false,
        ]);

        if (! $response->successful()) {
            $this->warn("Paystack rejected update for {$tier->value} ({$code}): ".$response->body());

            return null;
        }

        return $code;
    }
}
