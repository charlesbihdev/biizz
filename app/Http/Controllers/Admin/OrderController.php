<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\MarketplacePurchase;
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Business $business): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        if ($business->business_type === 'digital') {
            return $this->digitalIndex($business);
        }

        $orders = Order::withCount('items')
            ->when(request('status'), fn ($q, $s) => $q->where('status', $s))
            ->when(request('search'), function ($q, $term) {
                $q->where(function ($q) use ($term) {
                    $q->where('customer_name', 'like', "%{$term}%")
                        ->orWhere('customer_email', 'like', "%{$term}%")
                        ->orWhere('order_id', 'like', "%{$term}%");
                });
            })
            ->when(request('date') && request('date') !== 'all', fn ($q) => $this->applyDateFilter($q, request('date')))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'isDigital' => false,
            'business' => $business,
            'statuses' => collect(OrderStatus::cases())->map(fn (OrderStatus $s) => ['name' => $s->label(), 'value' => $s->value])->all(),
            'filters' => [
                'status' => request('status', 'all'),
                'search' => request('search', ''),
                'date' => request('date', 'all'),
                'date_from' => request('date_from', ''),
                'date_to' => request('date_to', ''),
            ],
            'stats' => Inertia::defer(fn () => $this->buildStats($business)),
        ]);
    }

    private function digitalIndex(Business $business): Response
    {
        $purchases = MarketplacePurchase::with(['buyer:id,name,email', 'product:id,name,slug'])
            ->when(request('status') && request('status') !== 'all', fn ($q) => $q->where('status', request('status')))
            ->when(request('search'), function ($q, $term) {
                $q->where(function ($q) use ($term) {
                    $q->whereHas('buyer', function ($q) use ($term) {
                        $q->where('name', 'like', "%{$term}%")
                            ->orWhere('email', 'like', "%{$term}%");
                    })->orWhereHas('product', function ($q) use ($term) {
                        $q->withoutGlobalScopes()->where('name', 'like', "%{$term}%");
                    });
                });
            })
            ->when(request('date') && request('date') !== 'all', fn ($q) => $this->applyDateFilter($q, request('date')))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'purchases' => $purchases,
            'isDigital' => true,
            'business' => $business,
            'filters' => [
                'status' => request('status', 'all'),
                'search' => request('search', ''),
                'date' => request('date', 'all'),
                'date_from' => request('date_from', ''),
                'date_to' => request('date_to', ''),
            ],
            'stats' => Inertia::defer(fn () => $this->buildDigitalStats($business)),
        ]);
    }

    private function buildStats(Business $business): array
    {
        $base = fn () => $this->applyStatsFilters(
            Order::query()->where('business_id', $business->id),
            isDigital: false,
        );

        return [
            'revenue_total' => (string) $base()->whereIn('status', [OrderStatus::Paid, OrderStatus::Fulfilled])->sum('total'),
            'paid' => $base()->where('status', OrderStatus::Paid)->count(),
            'fulfilled' => $base()->where('status', OrderStatus::Fulfilled)->count(),
            'cancelled' => $base()->whereIn('status', [OrderStatus::Cancelled, OrderStatus::Refunded])->count(),
        ];
    }

    private function buildDigitalStats(Business $business): array
    {
        $base = fn () => $this->applyStatsFilters(
            MarketplacePurchase::query(),
            isDigital: true,
        );

        return [
            'revenue_total' => (string) $base()->where('status', 'paid')->sum('amount_paid'),
            'paid' => $base()->where('status', 'paid')->count(),
            'free' => $base()->where('status', 'free')->count(),
            'pending' => $base()->where('status', 'pending')->count(),
        ];
    }

    /**
     * Apply search and date filters to a stats query. Status is intentionally
     * excluded — the four tiles are the status breakdown, so filtering the breakdown
     * by one of its own slices would zero out the others.
     */
    private function applyStatsFilters(Builder $q, bool $isDigital): Builder
    {
        if ($term = request('search')) {
            $q->where(function ($q) use ($term, $isDigital) {
                if ($isDigital) {
                    $q->whereHas('buyer', fn ($q) => $q
                        ->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%"))
                        ->orWhereHas('product', fn ($q) => $q
                            ->withoutGlobalScopes()
                            ->where('name', 'like', "%{$term}%"));
                } else {
                    $q->where('customer_name', 'like', "%{$term}%")
                        ->orWhere('customer_email', 'like', "%{$term}%")
                        ->orWhere('order_id', 'like', "%{$term}%");
                }
            });
        }

        if (request('date') && request('date') !== 'all') {
            $this->applyDateFilter($q, request('date'));
        }

        return $q;
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

    public function show(Business $business, Order $order): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order->load(['items', 'items.product:id,slug']),
            'business' => $business,
            'statuses' => collect(OrderStatus::cases())->map(fn (OrderStatus $s) => ['name' => $s->label(), 'value' => $s->value])->all(),
        ]);
    }

    public function updateStatus(Request $request, Business $business, Order $order): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $validated = $request->validate([
            'status' => ['required', Rule::enum(OrderStatus::class)],
        ]);

        $order->update(['status' => $validated['status']]);

        return back()->with('success', 'Order status updated.');
    }
}
