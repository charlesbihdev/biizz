<?php

namespace App\Http\Controllers\StorefrontAuth;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Customer;
use App\Models\Scopes\BusinessScope;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;

class GoogleController extends Controller
{
    /**
     * Redirect the customer to Google's OAuth consent screen.
     *
     * We store the business slug in the session so the single callback URL
     * can restore which store this customer belongs to — Google requires a
     * fixed redirect URI so we cannot embed the slug in the callback URL.
     */
    public function redirect(Request $request, Business $business): \Symfony\Component\HttpFoundation\RedirectResponse|RedirectResponse
    {
        $request->session()->put('customer_auth_slug', $business->slug);
        $request->session()->put('customer_auth_return', url()->previous());

        /** @var AbstractProvider $driver */
        $driver = Socialite::driver('google');

        return $driver->redirectUrl(route('customer.auth.google.callback'))->redirect();
    }

    /**
     * Handle the callback from Google.
     *
     * Restores business context from session, then finds or creates the
     * customer record for that business. Same Google account on two different
     * stores creates two separate customer records — by design.
     */
    public function callback(Request $request): RedirectResponse
    {
        try {
            /** @var AbstractProvider $driver */
            $driver = Socialite::driver('google');
            $googleUser = $driver->redirectUrl(route('customer.auth.google.callback'))->user();
        } catch (\Throwable) {
            return $this->failRedirect($request, 'Google sign-in failed. Please try again.');
        }

        $slug = $request->session()->pull('customer_auth_slug');
        $returnUrl = $request->session()->pull('customer_auth_return');

        if (! $slug) {
            return redirect('/')->with('error', 'Session expired. Please try again.');
        }

        $business = Business::where('slug', $slug)->first();

        if (! $business) {
            return redirect('/')->with('error', 'Store not found.');
        }

        // Find by google_id first, then fall back to email — both scoped to this business
        $customer = Customer::withoutGlobalScope(BusinessScope::class)
            ->where('business_id', $business->id)
            ->where('google_id', $googleUser->getId())
            ->first();

        if (! $customer) {
            $customer = Customer::withoutGlobalScope(BusinessScope::class)
                ->where('business_id', $business->id)
                ->where('email', $googleUser->getEmail())
                ->first();

            if ($customer) {
                // Link existing email account to Google
                $customer->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            } else {
                // First-time Google login — create a new customer account for this store
                $customer = Customer::withoutGlobalScope(BusinessScope::class)->create([
                    'business_id' => $business->id,
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                ]);
            }
        }

        Auth::guard('customer')->login($customer, remember: true);

        $request->session()->regenerate();

        return redirect($returnUrl ?? route('storefront.show', $business->slug));
    }

    private function failRedirect(Request $request, string $message): RedirectResponse
    {
        $slug = $request->session()->pull('customer_auth_slug');
        $target = $slug ? route('storefront.show', $slug) : '/';

        return redirect($target)->with('error', $message);
    }
}
