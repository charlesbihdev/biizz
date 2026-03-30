<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Order;
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

        $orders = Order::withCount('items')
            ->when(request('status'), fn ($q, $s) => $q->where('status', $s))
            ->when(request('search'), function ($q, $term) {
                $q->where(function ($q) use ($term) {
                    $q->where('customer_name', 'like', "%{$term}%")
                        ->orWhere('customer_email', 'like', "%{$term}%")
                        ->orWhere('order_id', 'like', "%{$term}%");
                });
            })
            ->when(request('date'), function ($q, $preset) {
                match ($preset) {
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
                    default => null,
                };
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'business' => $business,
            'statuses' => collect(OrderStatus::cases())->map(fn (OrderStatus $s) => ['name' => $s->label(), 'value' => $s->value])->all(),
            'filters' => [
                'status' => request('status', 'all'),
                'search' => request('search', ''),
                'date' => request('date', 'all'),
                'date_from' => request('date_from', ''),
                'date_to' => request('date_to', ''),
            ],
        ]);
    }

    public function show(Business $business, Order $order): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order->load('items'),
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
