<?php

namespace App\Http\Controllers\MarketplaceAuth;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class BecomeCreatorController extends Controller
{
    /**
     * Create a creator (User) account from the authenticated buyer's data.
     *
     * No re-authentication needed — buyer is already authenticated.
     * Google buyers: google_id + avatar copied, no password.
     * Email/password buyers: hashed password copied from buyers table.
     */
    public function store(): RedirectResponse
    {
        /** @var Buyer $buyer */
        $buyer = Auth::guard('buyer')->user();

        // If a creator account already exists with this email, just redirect to login.
        if (User::where('email', $buyer->email)->exists()) {
            return redirect()->route('login')
                ->with('info', 'You already have a creator account. Sign in to access it.');
        }

        $user = User::create([
            'name' => $buyer->name,
            'email' => $buyer->email,
            'password' => $buyer->password,       // already hashed (null for Google buyers)
            'google_id' => $buyer->google_id,
            'avatar' => $buyer->avatar,
        ]);

        Auth::guard('web')->login($user);

        return redirect()->route('dashboard')
            ->with('success', 'Welcome! Your creator account is ready.');
    }
}
