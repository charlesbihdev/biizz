<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePaymentKeysRequest;
use App\Models\Business;
use App\Models\MarketplacePayment;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    public function index(Business $business): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        if ($business->business_type === 'digital') {
            return $this->digitalIndex($business);
        }

        $payments = Payment::query()
            ->with([
                'order:id,order_id,customer_name,customer_email',
                'customer:id,name,email',
            ])
            ->when(request('status') && request('status') !== 'all', fn ($q) => $q->where('status', request('status')))
            ->when(request('gateway') && request('gateway') !== 'all', fn ($q) => $q->where('gateway', request('gateway')))
            ->when(request('search'), function ($q, $term) {
                $q->where(function ($q) use ($term) {
                    $q->where('reference', 'like', "%{$term}%")
                        ->orWhere('transaction_id', 'like', "%{$term}%")
                        ->orWhereHas('order', function ($q) use ($term) {
                            $q->where('customer_name', 'like', "%{$term}%")
                                ->orWhere('customer_email', 'like', "%{$term}%")
                                ->orWhere('order_id', 'like', "%{$term}%");
                        });
                });
            })
            ->when(request('date') && request('date') !== 'all', fn ($q) => $this->applyDateFilter($q, request('date')))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'isDigital' => false,
            'business' => $business,
            'statuses' => $this->statusOptions(),
            'gateways' => $this->gatewayOptions(),
            'filters' => $this->filterState(),
            'stats' => Inertia::defer(fn () => $this->buildStats($business)),
        ]);
    }

    private function digitalIndex(Business $business): Response
    {
        $payments = MarketplacePayment::query()
            ->with([
                'purchase.buyer:id,name,email',
                'purchase.product:id,name,slug',
            ])
            ->when(request('status') && request('status') !== 'all', fn ($q) => $q->where('status', request('status')))
            ->when(request('gateway') && request('gateway') !== 'all', fn ($q) => $q->where('gateway', request('gateway')))
            ->when(request('search'), function ($q, $term) {
                $q->where(function ($q) use ($term) {
                    $q->where('reference', 'like', "%{$term}%")
                        ->orWhere('transaction_id', 'like', "%{$term}%")
                        ->orWhereHas('purchase.buyer', function ($q) use ($term) {
                            $q->where('name', 'like', "%{$term}%")
                                ->orWhere('email', 'like', "%{$term}%");
                        });
                });
            })
            ->when(request('date') && request('date') !== 'all', fn ($q) => $this->applyDateFilter($q, request('date')))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'isDigital' => true,
            'business' => $business,
            'statuses' => $this->statusOptions(),
            'gateways' => $this->gatewayOptions(),
            'filters' => $this->filterState(),
            'stats' => Inertia::defer(fn () => $this->buildDigitalStats($business)),
        ]);
    }

    public function show(Business $business, Payment $payment): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);
        abort_unless($payment->business_id === $business->id, 404);

        $payment->load([
            'order.items',
            'customer:id,name,email,phone',
        ]);

        return Inertia::render('Admin/Payments/Show', [
            'payment' => $payment,
            'business' => $business,
        ]);
    }

    public function showMarketplace(Business $business, MarketplacePayment $payment): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);
        abort_unless($payment->business_id === $business->id, 404);

        $payment->load([
            'purchase.buyer:id,name,email',
            'purchase.product:id,name,slug',
        ]);

        return Inertia::render('Admin/Payments/MarketplaceShow', [
            'payment' => $payment,
            'business' => $business,
        ]);
    }

    private function applyDateFilter(Builder $q, string $preset): Builder
    {
        return match ($preset) {
            'today' => $q->whereDate('created_at', today()),
            'yesterday' => $q->whereDate('created_at', today()->subDay()),
            'this_week' => $q->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]),
            'last_week' => $q->whereBetween('created_at', [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()]),
            'this_month' => $q->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year),
            'last_month' => $q->whereMonth('created_at', now()->subMonth()->month)->whereYear('created_at', now()->subMonth()->year),
            'this_year' => $q->whereYear('created_at', now()->year),
            'last_year' => $q->whereYear('created_at', now()->subYear()->year),
            'custom' => $q->when(request('date_from'), fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
                ->when(request('date_to'), fn ($q, $d) => $q->whereDate('created_at', '<=', $d)),
            default => $q,
        };
    }

    private function buildStats(Business $business): array
    {
        $base = fn () => $this->applyStatsFilters(
            Payment::query()->where('business_id', $business->id),
            isDigital: false,
        );

        return [
            'received_total' => (string) $base()->where('status', PaymentStatus::Success)->sum('amount'),
            'success' => $base()->where('status', PaymentStatus::Success)->count(),
            'pending' => $base()->where('status', PaymentStatus::Pending)->count(),
            'failed' => $base()->where('status', PaymentStatus::Failed)->count(),
        ];
    }

    private function buildDigitalStats(Business $business): array
    {
        $base = fn () => $this->applyStatsFilters(
            MarketplacePayment::query(),
            isDigital: true,
        );

        return [
            'received_total' => (string) $base()->where('status', PaymentStatus::Success)->sum('amount'),
            'success' => $base()->where('status', PaymentStatus::Success)->count(),
            'pending' => $base()->where('status', PaymentStatus::Pending)->count(),
            'failed' => $base()->where('status', PaymentStatus::Failed)->count(),
        ];
    }

    /**
     * Apply gateway, search, and date filters to a stats query. Status is intentionally
     * excluded — the four tiles are the status breakdown, so filtering the breakdown
     * by one of its own slices would zero out the others.
     */
    private function applyStatsFilters(Builder $q, bool $isDigital): Builder
    {
        if (request('gateway') && request('gateway') !== 'all') {
            $q->where('gateway', request('gateway'));
        }

        if ($term = request('search')) {
            $q->where(function ($q) use ($term, $isDigital) {
                $q->where('reference', 'like', "%{$term}%")
                    ->orWhere('transaction_id', 'like', "%{$term}%");

                if ($isDigital) {
                    $q->orWhereHas('purchase.buyer', fn ($q) => $q
                        ->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%"));
                } else {
                    $q->orWhereHas('order', fn ($q) => $q
                        ->where('customer_name', 'like', "%{$term}%")
                        ->orWhere('customer_email', 'like', "%{$term}%")
                        ->orWhere('order_id', 'like', "%{$term}%"));
                }
            });
        }

        if (request('date') && request('date') !== 'all') {
            $this->applyDateFilter($q, request('date'));
        }

        return $q;
    }

    private function statusOptions(): array
    {
        return collect(PaymentStatus::cases())
            ->map(fn (PaymentStatus $s) => ['name' => $s->label(), 'value' => $s->value])
            ->all();
    }

    private function gatewayOptions(): array
    {
        return [
            ['name' => 'Paystack', 'value' => PaymentService::PROVIDER_PAYSTACK],
            ['name' => 'Junipay', 'value' => PaymentService::PROVIDER_JUNIPAY],
        ];
    }

    private function filterState(): array
    {
        return [
            'status' => request('status', 'all'),
            'gateway' => request('gateway', 'all'),
            'search' => request('search', ''),
            'date' => request('date', 'all'),
            'date_from' => request('date_from', ''),
            'date_to' => request('date_to', ''),
        ];
    }

    /**
     * Encrypt and store a payment provider API key (+ client ID for Junipay).
     * The plaintext key is handled by PaymentService — never touches a controller property.
     */
    public function store(UpdatePaymentKeysRequest $request, Business $business): RedirectResponse
    {
        $provider = $request->validated('provider');

        try {
            if ($provider === PaymentService::PROVIDER_JUNIPAY) {
                $this->paymentService->storeJunipayMeta(
                    $business,
                    $request->validated('client_id'),
                    $request->validated('token_link'),
                    auth()->user()
                );
            }

            $this->paymentService->storeKey(
                $business,
                $provider,
                $request->validated('key'),
                auth()->user()
            );
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        if (! $business->default_payment_provider) {
            $business->update(['default_payment_provider' => $provider]);
        }

        return back()->with('success', 'Payment provider connected.');
    }

    /**
     * Set the default payment provider for checkout.
     */
    public function setDefault(Request $request, Business $business): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $provider = $request->validate([
            'provider' => ['required', 'string', 'in:'.PaymentService::PROVIDER_PAYSTACK.','.PaymentService::PROVIDER_JUNIPAY],
        ])['provider'];

        $business->update(['default_payment_provider' => $provider]);

        return back()->with('success', ucfirst($provider).' set as default provider.');
    }

    /**
     * Remove a payment provider key.
     */
    public function destroy(Business $business, string $provider): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $this->paymentService->removeKey($business, $provider, auth()->user());

        if ($business->default_payment_provider === $provider) {
            $other = $provider === PaymentService::PROVIDER_PAYSTACK
                ? PaymentService::PROVIDER_JUNIPAY
                : PaymentService::PROVIDER_PAYSTACK;

            $business->update([
                'default_payment_provider' => $this->paymentService->hasKey($business->fresh(), $other) ? $other : null,
            ]);
        }

        return back()->with('success', 'Payment provider disconnected.');
    }

    /**
     * Build the providers data array for the settings page.
     */
    public static function providersData(Business $business, PaymentService $paymentService): array
    {
        return [
            'paystack' => [
                'connected' => $paymentService->hasKey($business, PaymentService::PROVIDER_PAYSTACK),
                'label' => 'Paystack',
                'regions' => ['Nigeria', 'Ghana', 'Kenya', 'South Africa'],
            ],
            'junipay' => [
                'connected' => $paymentService->hasKey($business, PaymentService::PROVIDER_JUNIPAY),
                'has_client_id' => ! empty($business->junipay_client_id),
                'label' => 'Junipay',
                'regions' => ['West Africa'],
            ],
        ];
    }
}
