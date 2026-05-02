<?php

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    Storage::fake('s3');

    $this->user = User::factory()->create();
    $this->business = Business::factory()->for($this->user, 'owner')->create([
        'business_type' => 'physical',
    ]);
    $this->category = Category::create([
        'business_id' => $this->business->id,
        'name' => 'Default',
    ]);
    actingAs($this->user);
});

function payload(array $overrides = []): array
{
    /** @var Category $category */
    $category = test()->category;

    return array_merge([
        'name' => 'New product',
        'category_id' => $category->id,
        'price' => 10,
        'stock' => 5,
    ], $overrides);
}

// ---------------------------------------------------------------------------
// Product count limit
// ---------------------------------------------------------------------------

test('free businesses can create up to the configured product cap', function () {
    Product::factory()->for($this->business)->count(2)->create();

    $this->post(route('businesses.products.store', $this->business), payload())
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($this->business->products()->count())->toBe(3);
});

test('free businesses are blocked at the product cap with 402', function () {
    Product::factory()->for($this->business)->count(3)->create();

    $this->post(route('businesses.products.store', $this->business), payload(['name' => 'Fourth']))
        ->assertStatus(402);

    expect($this->business->products()->count())->toBe(3);
});

test('pro businesses use the pro product cap', function () {
    $this->business->setTier(SubscriptionTier::Pro);
    $proCap = config('biizz.tiers.pro.limits.max_products');

    Product::factory()->for($this->business)->count($proCap - 1)->create();

    // Up to the Pro cap is allowed.
    $this->post(route('businesses.products.store', $this->business), payload())
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($this->business->products()->count())->toBe($proCap);

    // One past the Pro cap is blocked with 402.
    $this->post(route('businesses.products.store', $this->business), payload(['name' => 'Over cap']))
        ->assertStatus(402);
});

test('pro_max businesses use the pro_max product cap', function () {
    $this->business->setTier(SubscriptionTier::ProMax);
    $proCap = config('biizz.tiers.pro.limits.max_products');

    // ProMax can go past the Pro cap.
    Product::factory()->for($this->business)->count($proCap + 5)->create();

    $this->post(route('businesses.products.store', $this->business), payload())
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($this->business->products()->count())->toBe($proCap + 6);
});

test('downgraded businesses keep their existing products but cannot add new ones', function () {
    // Was Pro, had 5 products, now downgraded back to Free.
    $this->business->setTier(SubscriptionTier::Pro);
    Product::factory()->for($this->business)->count(5)->create();
    $this->business->setTier(SubscriptionTier::Free);

    // Existing data preserved — see ANALYTICS_TIERS.md section 1.4.
    expect($this->business->products()->count())->toBe(5);

    // But new actions are blocked.
    $this->post(route('businesses.products.store', $this->business), payload(['name' => 'Sixth']))
        ->assertStatus(402);
});

// ---------------------------------------------------------------------------
// Product image count limit
// ---------------------------------------------------------------------------

test('free businesses can submit one image per product', function () {
    $this->post(route('businesses.products.store', $this->business), payload([
        'images' => [
            ['file' => UploadedFile::fake()->image('a.jpg', 800, 600)],
        ],
    ]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($this->business->products()->latest()->first()->images()->count())->toBe(1);
});

test('free businesses are rejected when submitting more than the image cap', function () {
    $this->post(route('businesses.products.store', $this->business), payload([
        'images' => [
            ['file' => UploadedFile::fake()->image('a.jpg', 800, 600)],
            ['file' => UploadedFile::fake()->image('b.jpg', 800, 600)],
        ],
    ]))
        ->assertSessionHasErrors('images');

    expect($this->business->products()->count())->toBe(0);
});

test('pro businesses can submit up to eight images', function () {
    $this->business->setTier(SubscriptionTier::Pro);

    $this->post(route('businesses.products.store', $this->business), payload([
        'images' => array_fill(0, 8, ['file' => UploadedFile::fake()->image('img.jpg', 800, 600)]),
    ]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($this->business->products()->latest()->first()->images()->count())->toBe(8);
});

test('pro businesses are rejected at nine images', function () {
    $this->business->setTier(SubscriptionTier::Pro);

    $this->post(route('businesses.products.store', $this->business), payload([
        'images' => array_fill(0, 9, ['file' => UploadedFile::fake()->image('img.jpg', 800, 600)]),
    ]))
        ->assertSessionHasErrors('images');
});

test('pro_max businesses can submit up to twenty images', function () {
    $this->business->setTier(SubscriptionTier::ProMax);

    $this->post(route('businesses.products.store', $this->business), payload([
        'images' => array_fill(0, 20, ['file' => UploadedFile::fake()->image('img.jpg', 800, 600)]),
    ]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($this->business->products()->latest()->first()->images()->count())->toBe(20);
});

// ---------------------------------------------------------------------------
// Index page exposes the unfiltered product count for the frontend gate
// ---------------------------------------------------------------------------

test('products index exposes products_count for the tier-aware Add CTA', function () {
    Product::factory()->for($this->business)->count(2)->create(['is_active' => true]);
    Product::factory()->for($this->business)->create(['is_active' => false]);

    $this->get(route('businesses.products.index', ['business' => $this->business, 'status' => 'active']))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                // Filter narrows visible rows to 2…
                ->has('products.data', 2)
                // …but the unfiltered count for the gate is the real total.
                ->where('products_count', 3)
        );
});
