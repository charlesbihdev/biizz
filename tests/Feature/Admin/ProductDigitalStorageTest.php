<?php

use App\Enums\SubscriptionTier;
use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductFile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;

beforeEach(function (): void {
    Storage::fake('s3');
    Storage::fake('s3_private');

    $this->user = User::factory()->create();
    $this->business = Business::factory()->for($this->user, 'owner')->create([
        'business_type' => 'digital',
    ]);
    $this->category = Category::create([
        'business_id' => $this->business->id,
        'name' => 'Default',
    ]);
    actingAs($this->user);
});

function digitalPayload(array $overrides = []): array
{
    /** @var Category $category */
    $category = test()->category;

    return array_merge([
        'name' => 'Storage tier test',
        'description' => 'Digital product.',
        'price' => 50,
        'stock' => 0,
        'category_id' => $category->id,
        'digital_category' => 'ebooks',
        'delivery_mode' => 'download',
        'images' => [
            ['file' => UploadedFile::fake()->image('cover.jpg', 800, 600)],
        ],
    ], $overrides);
}

// ---------------------------------------------------------------------------
// Per-file size cap (Free tier)
// ---------------------------------------------------------------------------

test('free tier rejects digital files larger than 10 MB', function () {
    $this->post(route('businesses.products.store', $this->business), digitalPayload([
        'digital_file' => UploadedFile::fake()->create('big.zip', 11 * 1024, 'application/zip'),
    ]))
        ->assertSessionHasErrors('digital_file');

    expect($this->business->products()->count())->toBe(0);
});

test('free tier accepts digital files under the 10 MB per-file cap', function () {
    $this->post(route('businesses.products.store', $this->business), digitalPayload([
        'digital_file' => UploadedFile::fake()->create('small.pdf', 8 * 1024, 'application/pdf'),
    ]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($this->business->products()->count())->toBe(1);
});

// ---------------------------------------------------------------------------
// Cumulative quota (Free safety net at 50 MB)
// ---------------------------------------------------------------------------

test('free tier blocks uploads that push the storage total over the quota', function () {
    // Seed 45 MB of existing digital files, then try to upload an 8 MB file.
    // Per-file cap (10 MB) passes; cumulative quota (50 MB) does not.
    $existing = Product::factory()->for($this->business)->create();
    ProductFile::factory()->for($existing)->create([
        'file_size' => 45 * 1024 * 1024,
    ]);

    $this->post(route('businesses.products.store', $this->business), digitalPayload([
        'digital_file' => UploadedFile::fake()->create('extra.pdf', 8 * 1024, 'application/pdf'),
    ]))
        ->assertStatus(402);

    expect($this->business->products()->where('name', 'Storage tier test')->count())->toBe(0);
});

// ---------------------------------------------------------------------------
// Tier upgrades lift the limits
// ---------------------------------------------------------------------------

test('pro tier accepts digital files larger than 10 MB', function () {
    $this->business->setTier(SubscriptionTier::Pro);

    // 100 MB ZIP. Free would reject this; Pro has no per-file cap.
    $this->post(route('businesses.products.store', $this->business), digitalPayload([
        'digital_file' => UploadedFile::fake()->create('chunky.zip', 100 * 1024, 'application/zip'),
    ]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($this->business->products()->count())->toBe(1);
});

test('pro tier blocks uploads that push the storage total over 10 GB', function () {
    $this->business->setTier(SubscriptionTier::Pro);

    // Seed ~9.99 GB of existing files, then attempt a 50 MB upload that
    // crosses the 10 GB ceiling.
    $existing = Product::factory()->for($this->business)->create();
    ProductFile::factory()->for($existing)->create([
        'file_size' => (int) (9.99 * 1024 * 1024 * 1024),
    ]);

    $this->post(route('businesses.products.store', $this->business), digitalPayload([
        'digital_file' => UploadedFile::fake()->create('big.zip', 50 * 1024, 'application/zip'),
    ]))
        ->assertStatus(402);
});

// ---------------------------------------------------------------------------
// Storage snapshot is shared via Inertia
// ---------------------------------------------------------------------------

test('digital storage snapshot is exposed on Inertia shared props', function () {
    $product = Product::factory()->for($this->business)->create();
    ProductFile::factory()->for($product)->create([
        'file_size' => 12 * 1024 * 1024,
    ]);

    $this->get(route('businesses.products.index', $this->business))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->where('digitalStorage.used_bytes', 12 * 1024 * 1024)
                ->where('digitalStorage.quota_bytes', 50 * 1024 * 1024)
                ->where('digitalStorage.per_file_max_bytes', 10 * 1024 * 1024)
        );
});
