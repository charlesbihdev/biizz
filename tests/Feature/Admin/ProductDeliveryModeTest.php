<?php

use App\Models\Business;
use App\Models\Category;
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

function basePayload(array $overrides = []): array
{
    /** @var Category $category */
    $category = test()->category;

    return array_merge([
        'name' => 'Test Product',
        'description' => 'A digital product.',
        'price' => 50,
        'stock' => 0,
        'category_id' => $category->id,
        'digital_category' => 'ebooks',
        'images' => [
            ['file' => UploadedFile::fake()->image('cover.jpg', 800, 600)],
        ],
    ], $overrides);
}

test('digital product requires delivery_mode', function () {
    $this->post(route('businesses.products.store', $this->business), basePayload())
        ->assertSessionHasErrors('delivery_mode');
});

test('delivery_mode must be one of the allowed values', function () {
    $this->post(route('businesses.products.store', $this->business), basePayload([
        'delivery_mode' => 'webinar',
        'digital_file' => UploadedFile::fake()->create('book.pdf', 200, 'application/pdf'),
    ]))->assertSessionHasErrors('delivery_mode');
});

test('reader mode requires a digital file', function () {
    $this->post(route('businesses.products.store', $this->business), basePayload([
        'delivery_mode' => 'reader',
    ]))->assertSessionHasErrors('digital_file');
});

test('download mode requires a digital file', function () {
    $this->post(route('businesses.products.store', $this->business), basePayload([
        'delivery_mode' => 'download',
    ]))->assertSessionHasErrors('digital_file');
});

test('reader mode saves with a pdf file', function () {
    $this->post(route('businesses.products.store', $this->business), basePayload([
        'delivery_mode' => 'reader',
        'digital_file' => UploadedFile::fake()->create('book.pdf', 200, 'application/pdf'),
    ]))->assertSessionHasNoErrors();

    expect($this->business->products()->first())
        ->delivery_mode->toBe('reader')
        ->external_url->toBeNull();
});

test('external_link mode requires external_url', function () {
    $this->post(route('businesses.products.store', $this->business), basePayload([
        'delivery_mode' => 'external_link',
    ]))->assertSessionHasErrors('external_url');
});

test('external_link mode saves with url and no file', function () {
    $this->post(route('businesses.products.store', $this->business), basePayload([
        'delivery_mode' => 'external_link',
        'external_url' => 'https://teachable.com/p/my-course',
    ]))->assertSessionHasNoErrors();

    expect($this->business->products()->first())
        ->delivery_mode->toBe('external_link')
        ->external_url->toBe('https://teachable.com/p/my-course');
});

test('external_url must be a valid url', function () {
    $this->post(route('businesses.products.store', $this->business), basePayload([
        'delivery_mode' => 'external_link',
        'external_url' => 'not-a-url',
    ]))->assertSessionHasErrors('external_url');
});

test('physical product saves with null delivery_mode', function () {
    $physical = Business::factory()->for($this->user, 'owner')->create([
        'business_type' => 'physical',
    ]);
    $category = Category::create(['business_id' => $physical->id, 'name' => 'Apparel']);

    $this->post(route('businesses.products.store', $physical), [
        'name' => 'T-shirt',
        'category_id' => $category->id,
        'price' => 25,
        'stock' => 10,
    ])->assertSessionHasNoErrors();

    expect($physical->products()->first())
        ->delivery_mode->toBeNull()
        ->external_url->toBeNull();
});
