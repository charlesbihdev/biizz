<?php

namespace App\Http\Controllers\MarketplaceAuth;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;

class GoogleController extends Controller
{
    /**
     * Redirect the buyer to Google's OAuth consent screen.
     */
    public function redirect(Request $request): \Symfony\Component\HttpFoundation\RedirectResponse|RedirectResponse
    {
        $request->session()->put('buyer_auth_return', url()->previous());

        /** @var AbstractProvider $driver */
        $driver = Socialite::driver('google');

        return $driver->redirectUrl(route('marketplace.auth.google.callback'))->redirect();
    }

    /**
     * Handle the callback from Google — find or create a Buyer.
     */
    public function callback(Request $request): RedirectResponse
    {
        try {
            /** @var AbstractProvider $driver */
            $driver = Socialite::driver('google');
            $googleUser = $driver->redirectUrl(route('marketplace.auth.google.callback'))->user();
        } catch (\Throwable) {
            return redirect()->route('marketplace.login')
                ->with('error', 'Google sign-in failed. Please try again.');
        }

        $returnUrl = $request->session()->pull('buyer_auth_return');

        // Find by google_id first, fall back to email
        $buyer = Buyer::where('google_id', $googleUser->getId())->first();

        if (! $buyer) {
            $buyer = Buyer::where('email', $googleUser->getEmail())->first();

            if ($buyer) {
                // Link existing email account to Google
                $buyer->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            } else {
                // First-time Google login — create a new buyer account
                $buyer = Buyer::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                ]);
            }
        }

        Auth::guard('buyer')->login($buyer, remember: true);

        $request->session()->regenerate();

        return redirect($returnUrl ?? route('marketplace.library.index'));
    }
}
