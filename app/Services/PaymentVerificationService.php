<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Services\Payments\VerificationResult;
use Illuminate\Support\Facades\Log;

class PaymentVerificationService
{
    /**
     * Apply a verification result to the payment and its related order.
     *
     * Returns true if the payment is now marked successful.
     */
    public function process(Payment $payment, VerificationResult $result): bool
    {
        if ($result->successful) {
            $expectedMinor = (int) ($payment->amount * 100);

            if ($result->amountInMinorUnit !== $expectedMinor) {
                Log::warning('Payment amount mismatch', [
                    'reference' => $result->reference,
                    'expected' => $expectedMinor,
                    'received' => $result->amountInMinorUnit,
                ]);

                $payment->update([
                    'status' => PaymentStatus::Failed,
                    'metadata' => $result->metadata,
                ]);

                return false;
            }

            $now = now();

            $payment->update([
                'status' => PaymentStatus::Success,
                'transaction_id' => $result->transactionId,
                'paid_at' => $now,
                'metadata' => $result->metadata,
            ]);

            $payment->order()->update([
                'status' => OrderStatus::Paid,
                'paid_at' => $now,
            ]);

            return true;
        }

        $payment->update([
            'status' => PaymentStatus::Failed,
            'metadata' => $result->metadata,
        ]);

        return false;
    }
}
