<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Business;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->business = Business::factory()->for($this->user, 'owner')->create();
    actingAs($this->user);
});

test('stats are deferred so the list paints first', function () {
    Customer::factory()->for($this->business)->create();

    $this->get(route('businesses.customers.index', $this->business))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page
                ->component('Admin/Customers/Index')
                ->has('customers.data', 1)
                ->missing('stats')
        );
});

test('stats partial reload returns the four customer tiles', function () {
    $activeRepeat = Customer::factory()->for($this->business)->create(['name' => 'Ada Active']);
    $activeSingle = Customer::factory()->for($this->business)->create(['name' => 'Ben Active']);
    $blockedRepeat = Customer::factory()->for($this->business)->blocked()->create(['name' => 'Cara Blocked']);

    Order::factory()->for($this->business)->count(2)->create(['customer_id' => $activeRepeat->id]);
    Order::factory()->for($this->business)->create(['customer_id' => $activeSingle->id]);
    Order::factory()->for($this->business)->count(2)->create(['customer_id' => $blockedRepeat->id]);

    $version = app(HandleInertiaRequests::class)->version(request());

    $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (string) $version,
        'X-Inertia-Partial-Component' => 'Admin/Customers/Index',
        'X-Inertia-Partial-Data' => 'stats',
    ])
        ->get(route('businesses.customers.index', $this->business))
        ->assertOk()
        ->assertJsonPath('props.stats.total', 3)
        ->assertJsonPath('props.stats.active', 2)
        ->assertJsonPath('props.stats.blocked', 1)
        ->assertJsonPath('props.stats.repeat_buyers', 2);
});

test('stats apply both search and status filters', function () {
    $activeRepeat = Customer::factory()->for($this->business)->create([
        'name' => 'VIP Needle',
        'email' => 'needle-active@example.com',
    ]);
    $blockedSingle = Customer::factory()->for($this->business)->blocked()->create([
        'name' => 'VIP Blocked Needle',
        'email' => 'needle-blocked@example.com',
    ]);
    Customer::factory()->for($this->business)->create([
        'name' => 'Outside Match',
        'email' => 'outside@example.com',
    ]);

    Order::factory()->for($this->business)->count(2)->create(['customer_id' => $activeRepeat->id]);
    Order::factory()->for($this->business)->create(['customer_id' => $blockedSingle->id]);

    $version = app(HandleInertiaRequests::class)->version(request());

    $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (string) $version,
        'X-Inertia-Partial-Component' => 'Admin/Customers/Index',
        'X-Inertia-Partial-Data' => 'stats',
    ])
        ->get(route('businesses.customers.index', [
            $this->business,
            'search' => 'Needle',
            'status' => 'blocked',
        ]))
        ->assertOk()
        ->assertJsonPath('props.stats.total', 1)
        ->assertJsonPath('props.stats.active', 0)
        ->assertJsonPath('props.stats.blocked', 1)
        ->assertJsonPath('props.stats.repeat_buyers', 0);
});
