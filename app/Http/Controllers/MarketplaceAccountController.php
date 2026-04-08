<?php

namespace App\Http\Controllers;

use App\Models\Buyer;
use App\Models\MarketplacePurchase;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceAccountController extends Controller
{
    public function edit(Request $request): Response
    {
        /** @var Buyer $buyer */
        $buyer = $request->user('buyer');

        $stats = [
            'purchase_count' => MarketplacePurchase::where('buyer_id', $buyer->id)
                ->whereIn('status', ['paid', 'free'])
                ->count(),
            'total_spent' => (string) MarketplacePurchase::where('buyer_id', $buyer->id)
                ->where('status', 'paid')
                ->sum('amount_paid'),
        ];

        return Inertia::render('Marketplace/Dashboard/Account', [
            'buyer' => $buyer->only(['id', 'name', 'email', 'phone', 'google_id', 'avatar']),
            'stats' => $stats,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        /** @var Buyer $buyer */
        $buyer = $request->user('buyer');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'current_password' => ['nullable', 'current_password:buyer'],
            'password' => ['nullable', 'min:8', 'confirmed', Password::defaults()],
        ]);

        $buyer->update(array_filter([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'] ?? null,
        ], fn ($v) => $v !== null));

        return back()->with('success', 'Account updated.');
    }
}
