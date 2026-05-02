<?php

use App\Models\Business;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use App\Models\User;
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

test('product slug is lowercased on create', function () {
    $this->post(route('businesses.products.store', $this->business), [
        'name' => 'New product',
        'slug' => 'My-Product-Slug',
        'category_id' => $this->category->id,
        'price' => 10,
        'stock' => 5,
    ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($this->business->products()->latest()->first()->slug)
        ->toBe('my-product-slug');
});

test('product slug is lowercased on update', function () {
    $product = Product::factory()->for($this->business)->create(['slug' => 'original']);

    $this->patch(route('businesses.products.update', [$this->business, $product]), [
        'slug' => 'Updated-Slug',
    ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($product->fresh()->slug)->toBe('updated-slug');
});

test('business slug is lowercased on create', function () {
    $this->post(route('businesses.store'), [
        'name' => 'My New Store',
        'slug' => 'MyNewStore',
        'business_type' => 'physical',
        'business_category' => 'Fashion',
    ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(Business::where('slug', 'mynewstore')->exists())->toBeTrue();
});

test('page slug is lowercased on create', function () {
    // Avoid slugs that collide with DefaultPages stubs (e.g. about-us).
    $this->post(route('businesses.pages.store', $this->business), [
        'title' => 'Partner program',
        'slug' => 'Partner-Program',
        'is_published' => true,
    ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($this->business->pages()->latest()->first()->slug)->toBe('partner-program');
});

test('page slug is lowercased on update', function () {
    $page = Page::create([
        'business_id' => $this->business->id,
        'title' => 'Original',
        'slug' => 'original',
        'is_published' => true,
    ]);

    $this->patch(route('businesses.pages.update', [$this->business, $page]), [
        'slug' => 'Updated-Page-Slug',
    ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($page->fresh()->slug)->toBe('updated-page-slug');
});
