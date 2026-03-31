<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\Payment;
use App\Services\Payments\PaymentGatewayFactory;
use App\Services\PaymentVerificationService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CustomerAccountController extends Controller
{
    public function __construct(private readonly PaymentVerificationService $verificationService) {}

    /**
     * Redirect /account → /account/orders.
     */
    public function show(Business $business): RedirectResponse
    {
        $customer = Auth::guard('customer')->user();

        if (! $customer) {
            return redirect()->route('storefront.show', $business->slug);
        }

        return redirect()->route('customer.account.orders', $business->slug);
    }

    /**
     * Orders section — paginated and filterable.
     */
    public function orders(Business $business): Response|RedirectResponse
    {
        /** @var Customer|null $customer */
        $customer = Auth::guard('customer')->user();

        if (! $customer) {
            return redirect()->route('storefront.show', $business->slug);
        }

        $orders = $customer->orders()
            ->with('items')
            ->when(request('status'), fn ($q, $s) => $q->where('status', $s))
            ->when(request('search'), function ($q, $term) {
                $q->where('order_id', 'like', "%{$term}%");
            })
            ->when(request('date'), $this->dateFilterClosure())
            ->latest()
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Storefront/Account', [
            'business' => $business,
            'pages' => $this->publishedPages($business),
            'section' => 'orders',
            'orders' => $orders,
            'filters' => $this->filterState(),
        ]);
    }

    /**
     * Show a detailed order view.
     */
    public function showOrder(Business $business, Order $order): Response|RedirectResponse
    {
        $customer = Auth::guard('customer')->user();

        if (! $customer || $order->customer_id !== $customer->id) {
            abort(404);
        }

        $order->load('items');

        return Inertia::render('Storefront/Account', [
            'business' => $business,
            'pages' => $this->publishedPages($business),
            'section' => 'order',
            'order' => $order,
        ]);
    }

    /**
     * Payments section — orders with a payment reference, paginated and filterable.
     */
    public function payments(Business $business): Response|RedirectResponse
    {
        /** @var Customer|null $customer */
        $customer = Auth::guard('customer')->user();

        if (! $customer) {
            return redirect()->route('storefront.show', $business->slug);
        }

        $payments = $customer->orders()
            ->whereNotNull('payment_ref')
            ->when(request('status'), fn ($q, $s) => $q->where('status', $s))
            ->when(request('search'), function ($q, $term) {
                $q->where(function ($q) use ($term) {
                    $q->where('order_id', 'like', "%{$term}%")
                        ->orWhere('payment_ref', 'like', "%{$term}%");
                });
            })
            ->when(request('date'), $this->dateFilterClosure())
            ->latest()
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Storefront/Account', [
            'business' => $business,
            'pages' => $this->publishedPages($business),
            'section' => 'payments',
            'payments' => $payments,
            'filters' => $this->filterState(),
        ]);
    }

    /**
     * Show a detailed payment view.
     */
    public function showPayment(Business $business, Order $order): Response|RedirectResponse
    {
        $customer = Auth::guard('customer')->user();

        if (! $customer || $order->customer_id !== $customer->id) {
            abort(404);
        }

        $order->load('items');

        return Inertia::render('Storefront/Account', [
            'business' => $business,
            'pages' => $this->publishedPages($business),
            'section' => 'payment',
            'order' => $order,
        ]);
    }

    /**
     * Addresses section.
     */
    public function addresses(Business $business): Response|RedirectResponse
    {
        /** @var Customer|null $customer */
        $customer = Auth::guard('customer')->user();

        if (! $customer) {
            return redirect()->route('storefront.show', $business->slug);
        }

        return Inertia::render('Storefront/Account', [
            'business' => $business,
            'pages' => $this->publishedPages($business),
            'section' => 'addresses',
            'addresses' => $customer->addresses()->latest()->get(),
        ]);
    }

    /**
     * Profile section.
     */
    public function profile(Business $business): Response|RedirectResponse
    {
        $customer = Auth::guard('customer')->user();

        if (! $customer) {
            return redirect()->route('storefront.show', $business->slug);
        }

        return Inertia::render('Storefront/Account', [
            'business' => $business,
            'pages' => $this->publishedPages($business),
            'section' => 'profile',
        ]);
    }

    /**
     * Update the customer's profile (name, phone). Email is immutable.
     */
    public function updateProfile(Request $request, Business $business): RedirectResponse
    {
        /** @var Customer $customer */
        $customer = Auth::guard('customer')->user() ?? abort(403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        $customer->update($data);

        return back()->with('success', 'Profile updated.');
    }

    /**
     * Save a new delivery address for the customer.
     */
    public function storeAddress(Request $request, Business $business): RedirectResponse
    {
        /** @var Customer $customer */
        $customer = Auth::guard('customer')->user() ?? abort(403);

        $data = $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'street_address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'region' => ['required', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:100'],
            'is_default' => ['boolean'],
        ]);

        if (! empty($data['is_default'])) {
            $customer->addresses()->update(['is_default' => false]);
        }

        $customer->addresses()->create($data);

        return back()->with('success', 'Address saved.');
    }

    /**
     * Update a saved address.
     */
    public function updateAddress(Request $request, Business $business, CustomerAddress $address): RedirectResponse
    {
        /** @var Customer $customer */
        $customer = Auth::guard('customer')->user() ?? abort(403);

        abort_if($address->customer_id !== $customer->id, 403);

        $data = $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'street_address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'region' => ['required', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:100'],
            'is_default' => ['boolean'],
        ]);

        if (! empty($data['is_default'])) {
            $customer->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($data);

        return back()->with('success', 'Address updated.');
    }

    /**
     * Delete a saved address.
     */
    public function destroyAddress(Business $business, CustomerAddress $address): RedirectResponse
    {
        /** @var Customer $customer */
        $customer = Auth::guard('customer')->user() ?? abort(403);

        abort_if($address->customer_id !== $customer->id, 403);

        $address->delete();

        return back()->with('success', 'Address removed.');
    }

    /**
     * Re-verify a pending payment for a customer order.
     */
    public function verifyPayment(Business $business, Order $order): RedirectResponse
    {
        /** @var Customer $customer */
        $customer = Auth::guard('customer')->user() ?? abort(403);

        abort_if($order->customer_id !== $customer->id, 403);

        $payment = Payment::withoutGlobalScopes()
            ->where('order_id', $order->id)
            ->where('business_id', $business->id)
            ->first();

        if (! $payment) {
            return back()->with('error', 'No payment record found for this order.');
        }

        if ($payment->isSuccessful()) {
            return back()->with('success', 'Payment was already confirmed.');
        }

        try {
            $gateway = app(PaymentGatewayFactory::class)->make($business);
            $result = $gateway->verify($payment->reference, $business, $payment->transaction_id);
            $success = $this->verificationService->process($payment, $result);
        } catch (\Throwable $e) {
            Log::error('Account payment re-verification failed', [
                'order_id' => $order->id,
                'reference' => $payment->reference,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Verification failed. Please try again or contact support.');
        }

        return $success
            ? back()->with('success', 'Payment confirmed! Your order is now paid.')
            : back()->with('error', 'Payment could not be verified. Please contact the store.');
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private function publishedPages(Business $business): Collection
    {
        return $business->pages()->where('is_published', true)->orderBy('sort_order')->get();
    }

    /**
     * @return array{status: string, search: string, date: string, date_from: string, date_to: string}
     */
    private function filterState(): array
    {
        return [
            'status' => request('status', 'all'),
            'search' => request('search', ''),
            'date' => request('date', 'all'),
            'date_from' => request('date_from', ''),
            'date_to' => request('date_to', ''),
        ];
    }

    /**
     * Returns a closure that applies the date preset filter to a query builder.
     */
    private function dateFilterClosure(): \Closure
    {
        return function ($q, $preset) {
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
        };
    }
}
