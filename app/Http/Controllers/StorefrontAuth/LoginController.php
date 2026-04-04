<?php

namespace App\Http\Controllers\StorefrontAuth;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * Authenticate a customer against the active business.
     *
     * Credentials are scoped to (business_id, email) via CustomerUserProvider —
     * the same email in a different store is a different customer account.
     */
    public function store(Request $request, Business $business): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::guard('customer')->attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        /** @var Customer $customer */
        $customer = Auth::guard('customer')->user();

        if ($customer->is_blocked) {
            Auth::guard('customer')->logout();
            $request->session()->invalidate();

            throw ValidationException::withMessages([
                'email' => 'Your account has been blocked. Please contact the site admin.',
            ]);
        }

        $request->session()->regenerate();

        return back();
    }
}
