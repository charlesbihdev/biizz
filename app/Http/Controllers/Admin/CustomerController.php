<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Business $business): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $customers = Customer::withCount('orders')
            ->withSum('orders', 'total')
            ->when(request('search'), function ($q, $term) {
                $q->where(function ($q) use ($term) {
                    $q->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%");
                });
            })
            ->when(request('status') === 'blocked', fn($q) => $q->where('is_blocked', true))
            ->when(request('status') === 'active', fn($q) => $q->where('is_blocked', false))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Customers/Index', [
            'business' => $business,
            'customers' => $customers,
            'filters' => [
                'search' => request('search', ''),
                'status' => request('status', 'all'),
            ],
            'stats' => Inertia::defer(fn() => $this->buildStats($business)),
        ]);
    }

    private function buildStats(Business $business): array
    {
        $base = fn() => $this->applyStatsFilters(
            Customer::query()->where('business_id', $business->id),
        );

        return [
            'total' => $base()->count(),
            'active' => $base()->where('is_blocked', false)->count(),
            'blocked' => $base()->where('is_blocked', true)->count(),
            'repeat_buyers' => $base()->has('orders', '>=', 2)->count(),
        ];
    }

    /**
     * Apply active customer filters to a stats query.
     */
    private function applyStatsFilters(Builder $q): Builder
    {
        if ($term = request('search')) {
            $q->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('phone', 'like', "%{$term}%");
            });
        }

        if (request('status') === 'blocked') {
            $q->where('is_blocked', true);
        }

        if (request('status') === 'active') {
            $q->where('is_blocked', false);
        }

        return $q;
    }

    public function show(Business $business, Customer $customer): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $orders = $customer->orders()
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Customers/Show', [
            'business' => $business,
            'customer' => $customer,
            'orders' => $orders,
        ]);
    }

    public function update(Request $request, Business $business, Customer $customer): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $customer->update($validated);

        return back()->with('success', 'Customer updated.');
    }

    public function toggleBlock(Business $business, Customer $customer): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $customer->update(['is_blocked' => ! $customer->is_blocked]);

        $message = $customer->is_blocked ? 'Customer blocked.' : 'Customer unblocked.';

        return back()->with('success', $message);
    }

    public function destroy(Business $business, Customer $customer): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $customer->delete();

        return to_route('businesses.customers.index', $business)
            ->with('success', 'Customer deleted.');
    }
}
