<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\Product;
use App\Services\Payments\VerificationResult;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentVerificationService
{
    /**
     * Apply a verification result to the payment and its related order.
     *
     * Self-idempotent: re-fetches the payment with a row lock and bails if it
     * has already been marked successful, so concurrent calls (verify-redirect
     * racing the webhook, or webhook retries) cannot double-decrement stock or
     * fire side-effects twice.
     *
     * Returns true if the payment is now (or was already) marked successful.
     */
    public function process(Payment $payment, VerificationResult $result): bool
    {
        return DB::transaction(function () use ($payment, $result) {
            $locked = Payment::withoutGlobalScopes()
                ->whereKey($payment->getKey())
                ->lockForUpdate()
                ->first();

            if (! $locked) {
                return false;
            }

            if ($locked->isSuccessful()) {
                return true;
            }

            if (! $result->successful) {
                $locked->update([
                    'status' => PaymentStatus::Failed,
                    'metadata' => $result->metadata,
                ]);

                return false;
            }

            $expectedMinor = (int) ($locked->amount * 100);

            if ($result->amountInMinorUnit !== $expectedMinor) {
                Log::warning('Payment amount mismatch', [
                    'reference' => $result->reference,
                    'expected' => $expectedMinor,
                    'received' => $result->amountInMinorUnit,
                ]);

                $locked->update([
                    'status' => PaymentStatus::Failed,
                    'metadata' => $result->metadata,
                ]);

                return false;
            }

            $now = now();

            $locked->update([
                'status' => PaymentStatus::Success,
                'transaction_id' => $result->transactionId,
                'paid_at' => $now,
                'metadata' => $result->metadata,
            ]);

            $locked->order()->update([
                'status' => OrderStatus::Paid,
                'paid_at' => $now,
            ]);

            $this->decrementStock($locked);

            return true;
        });
    }

    /**
     * Atomically decrement stock for each line item on the paid order.
     *
     * Stock is allowed to go negative — the payment has already cleared, so
     * blocking would leave the buyer paid-but-unfulfilled. A negative stock
     * value surfaces on the dashboard as an "oversold" signal for the owner.
     */
    private function decrementStock(Payment $payment): void
    {
        $order = $payment->order()
            ->with('items:id,order_id,product_id,quantity')
            ->first();

        if (! $order) {
            return;
        }

        foreach ($order->items as $item) {
            Product::where('id', $item->product_id)
                ->decrement('stock', $item->quantity);
        }

        $oversold = Product::whereIn('id', $order->items->pluck('product_id'))
            ->where('stock', '<', 0)
            ->pluck('id');

        if ($oversold->isNotEmpty()) {
            Log::warning('Products oversold after payment', [
                'order_id' => $order->id,
                'product_ids' => $oversold->all(),
            ]);
        }
    }
}
