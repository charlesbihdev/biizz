<?php

namespace App\Http\Controllers\StorefrontAuth;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    /**
     * Register a new customer for the active business and log them in.
     *
     * Email uniqueness is enforced per-business, not globally —
     * the same email can register on multiple stores.
     */
    public function store(Request $request, Business $business): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        // Enforce per-business email uniqueness manually
        $exists = Customer::where('email', $data['email'])->exists();

        if ($exists) {
            return back()->withErrors(['email' => 'An account with this email already exists for this store.']);
        }

        $customer = Customer::create([
            'business_id' => $business->id,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'email_verified_at' => now(),
        ]);

        Auth::guard('customer')->login($customer);

        $request->session()->regenerate();

        return back();
    }
}
