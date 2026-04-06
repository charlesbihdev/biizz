<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\MarketplacePurchase;
use App\Models\Product;
use App\Notifications\MarketplacePurchaseNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MarketplacePurchaseController extends Controller
{
    public function store(Request $request, Business $business, Product $product): JsonResponse|RedirectResponse
    {
        abort_unless($business->business_type === 'digital' && $business->is_active, 404);
        abort_unless($product->is_active && $product->business_id === $business->id, 404);

        if (! $request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = $request->user();

        // Prevent duplicate purchases
        $existing = MarketplacePurchase::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            return to_route('marketplace.library.index')
                ->with('info', 'You already own this product.');
        }

        $price = (float) $product->price;

        // Free product — skip payment
        if ($price <= 0) {
            $purchase = MarketplacePurchase::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'amount_paid' => 0,
                'status' => 'free',
            ]);

            $user->notify(new MarketplacePurchaseNotification($purchase->load('product.images')));

            return to_route('marketplace.library.index')
                ->with('success', 'Your product is now available in your library.');
        }

        // Paid product — TODO: initiate Paystack (mirrors CheckoutController pattern)
        // For now, return a JSON response that the frontend will handle
        return response()->json([
            'requires_payment' => true,
            'amount' => $price,
            'product_name' => $product->name,
        ]);
    }
}
