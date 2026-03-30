<?php

namespace App\Http\Controllers\StorefrontAuth;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    /**
     * Log out the customer from the active store.
     *
     * Only the customer guard is logged out — the merchant (web guard)
     * session is unaffected.
     */
    public function destroy(Request $request, Business $business): RedirectResponse
    {
        Auth::guard('customer')->logout();

        $request->session()->regenerateToken();

        return redirect()->route('storefront.show', $business->slug);
    }
}
