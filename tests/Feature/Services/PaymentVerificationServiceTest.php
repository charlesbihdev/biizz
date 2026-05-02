<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Business;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Services\Payments\VerificationResult;
use App\Services\PaymentVerificationService;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->business = Business::factory()->for($this->user, 'owner')->create();
    $this->service = app(PaymentVerificationService::class);
});

function makePaidPaymentScenario(Business $business, array $items): Payment
{
    $order = Order::factory()->for($business)->create(['total' => 100]);

    foreach ($items as [$stock, $quantity]) {
        $product = Product::factory()->for($business)->create(['stock' => $stock]);
        OrderItem::factory()->for($order)->for($product)->create(['quantity' => $quantity]);
    }

    return Payment::factory()->for($business)->for($order)->create(['amount' => 100]);
}

function successfulResult(string $reference): VerificationResult
{
    return new VerificationResult(
        successful: true,
        reference: $reference,
        transactionId: 'txn_TEST',
        amountInMinorUnit: 10000,
        currency: 'GHS',
    );
}

test('process flips payment + order to success and decrements stock per item', function () {
    $payment = makePaidPaymentScenario($this->business, [[10, 2], [5, 1]]);

    $ok = $this->service->process($payment, successfulResult($payment->reference));

    expect($ok)->toBeTrue();

    $payment->refresh();
    expect($payment->status)->toBe(PaymentStatus::Success);
    expect($payment->order->refresh()->status)->toBe(OrderStatus::Paid);

    $items = $payment->order->items;
    expect($items[0]->product->refresh()->stock)->toBe(8); // 10 - 2
    expect($items[1]->product->refresh()->stock)->toBe(4); // 5 - 1
});

test('process is idempotent — second call does not double-decrement stock', function () {
    $payment = makePaidPaymentScenario($this->business, [[10, 3]]);

    $this->service->process($payment, successfulResult($payment->reference));
    $this->service->process($payment->fresh(), successfulResult($payment->reference));

    $product = $payment->order->items->first()->product->refresh();
    expect($product->stock)->toBe(7); // 10 - 3, only once
});

test('process allows stock to go negative (oversold)', function () {
    $payment = makePaidPaymentScenario($this->business, [[1, 3]]);

    $this->service->process($payment, successfulResult($payment->reference));

    $product = $payment->order->items->first()->product->refresh();
    expect($product->stock)->toBe(-2); // 1 - 3
});

test('process marks payment failed and skips stock decrement on amount mismatch', function () {
    $payment = makePaidPaymentScenario($this->business, [[10, 2]]);

    $mismatched = new VerificationResult(
        successful: true,
        reference: $payment->reference,
        transactionId: 'txn_TEST',
        amountInMinorUnit: 999, // wrong
        currency: 'GHS',
    );

    $ok = $this->service->process($payment, $mismatched);

    expect($ok)->toBeFalse();
    expect($payment->refresh()->status)->toBe(PaymentStatus::Failed);
    expect($payment->order->items->first()->product->refresh()->stock)->toBe(10); // unchanged
});

test('process marks payment failed when verification result is unsuccessful', function () {
    $payment = makePaidPaymentScenario($this->business, [[10, 2]]);

    $failed = new VerificationResult(
        successful: false,
        reference: $payment->reference,
        transactionId: '',
        amountInMinorUnit: 0,
        currency: 'GHS',
    );

    $ok = $this->service->process($payment, $failed);

    expect($ok)->toBeFalse();
    expect($payment->refresh()->status)->toBe(PaymentStatus::Failed);
    expect($payment->order->items->first()->product->refresh()->stock)->toBe(10);
});
