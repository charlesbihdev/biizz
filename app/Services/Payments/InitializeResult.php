<?php

namespace App\Services\Payments;

/**
 * DTO returned by PaymentGateway::initialize().
 */
readonly class InitializeResult
{
    public function __construct(
        public string $redirectUrl,
        public string $reference,
        public string $accessCode = '',
    ) {}
}
