<?php

namespace App\Http\Controllers\MarketplaceAuth;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Marketplace/auth/register');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:buyers,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $buyer = Buyer::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'email_verified_at' => now(),
        ]);

        Auth::guard('buyer')->login($buyer);

        $request->session()->regenerate();

        return redirect()->intended(url()->previous() ?: route('marketplace.library.index'))
            ->with('success', 'Welcome! Your buyer account is ready.');
    }
}
