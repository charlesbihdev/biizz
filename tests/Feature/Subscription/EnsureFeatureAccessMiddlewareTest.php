<?php

use App\Enums\SubscriptionTier;
use App\Http\Middleware\EnsureFeatureAccess;
use App\Models\Business;
use App\Models\User;
use App\Services\BusinessContext;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

beforeEach(function () {
    $this->business = Business::factory()->for(User::factory(), 'owner')->create();
    $this->middleware = new EnsureFeatureAccess;
});

afterEach(fn () => BusinessContext::clear());

function invoke(EnsureFeatureAccess $m, string $featureKey): mixed
{
    return $m->handle(
        Request::create('/anywhere'),
        fn () => response()->json(['ok' => true]),
        $featureKey,
    );
}

test('aborts 403 when no business context is set', function () {
    BusinessContext::clear();

    try {
        invoke($this->middleware, 'analytics.compare_periods');
        $this->fail('Expected HttpException');
    } catch (HttpException $e) {
        expect($e->getStatusCode())->toBe(403);
    }
});

test('aborts 402 Payment Required for free businesses on a Pro feature', function () {
    BusinessContext::set($this->business);

    try {
        invoke($this->middleware, 'analytics.compare_periods');
        $this->fail('Expected HttpException');
    } catch (HttpException $e) {
        expect($e->getStatusCode())->toBe(402);
    }
});

test('passes through for pro businesses on a Pro feature', function () {
    $this->business->setTier(SubscriptionTier::Pro);
    BusinessContext::set($this->business->fresh());

    $response = invoke($this->middleware, 'analytics.compare_periods');

    expect($response->getStatusCode())->toBe(200)
        ->and($response->getData(true))->toBe(['ok' => true]);
});

test('passes through for pro_max businesses on a Pro Max feature', function () {
    $this->business->setTier(SubscriptionTier::ProMax);
    BusinessContext::set($this->business->fresh());

    $response = invoke($this->middleware, 'analytics.rfm');

    expect($response->getStatusCode())->toBe(200);
});

test('aborts 402 for pro businesses on a Pro Max feature', function () {
    $this->business->setTier(SubscriptionTier::Pro);
    BusinessContext::set($this->business->fresh());

    try {
        invoke($this->middleware, 'analytics.rfm');
        $this->fail('Expected HttpException');
    } catch (HttpException $e) {
        expect($e->getStatusCode())->toBe(402);
    }
});
