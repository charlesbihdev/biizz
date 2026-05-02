<?php

namespace App\Providers;

use App\Auth\AuthIntent;
use App\Auth\CustomerUserProvider;
use App\Services\BusinessContext;
use App\Services\Payments\PaystackGateway;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Default PaystackGateway uses the platform secret. Storefront and
        // marketplace flows that need a per-business merchant secret build
        // their own instance via PaymentGatewayFactory.
        $this->app->bind(PaystackGateway::class, fn () => new PaystackGateway(
            (string) config('services.paystack.secret', ''),
        ));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Auth::provider('customer', fn () => new CustomerUserProvider);

        $this->configureSingleIdentitySessions();
        $this->configureGuestRedirect();

        if (config('app.env') === 'production') {
            URL::forceScheme('https');

            request()->server->set('HTTPS', 'on');
        }

        $this->configureDefaults();
    }

    /**
     * Sign the visitor out of every guard except the one they just authenticated on.
     *
     * Listens for the framework Login event (fires on attempt() success or
     * Auth::guard($g)->login()) and clears the other two guards. This keeps
     * admin / customer / buyer identities mutually exclusive in a single session.
     */
    private function configureSingleIdentitySessions(): void
    {
        Event::listen(Login::class, function (Login $event): void {
            AuthIntent::clearOtherGuards($event->guard);
        });
    }

    /**
     * Decide where an already-authenticated visitor goes when they hit a guest-only route.
     *
     * Laravel 13's RedirectIfAuthenticated callback only receives the request,
     * not the guard the route was protecting, so we infer the destination from
     * the route itself (route name + BusinessContext) via AuthIntent. This
     * shares the same source of truth as the Inertia auth.activeGuard prop,
     * keeping the two in lockstep.
     */
    private function configureGuestRedirect(): void
    {
        RedirectIfAuthenticated::redirectUsing(function (Request $request): string {
            return match (AuthIntent::guardForRoute($request)) {
                'buyer' => route('marketplace.library.index'),
                'customer' => BusinessContext::isSet()
                    ? route('storefront.show', BusinessContext::current()->slug)
                    : '/',
                default => route('dashboard'),
            };
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn (): ?Password => app()->isProduction()
                ? Password::min(8)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
                : null,
        );
    }
}
