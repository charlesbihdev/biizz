<?php

namespace App\Services\Payments;

/**
 * DTO returned by PaymentGateway::verify().
 */
readonly class VerificationResult
{
    public function __construct(
        public bool $successful,
        public string $reference,
        public string $transactionId,
        public int $amountInMinorUnit,
        public string $currency,
        /** @var array<string, mixed> */
        public array $metadata = [],
    ) {}
}
