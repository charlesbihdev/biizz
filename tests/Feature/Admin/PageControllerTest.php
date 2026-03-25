<?php

use App\Models\Business;
use App\Models\Page;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->business = Business::factory()->for($this->user, 'owner')->create();
    actingAs($this->user);
});

test('index renders pages list', function () {
    // Business auto-creates 6 default pages on creation; add 3 more
    Page::factory()->for($this->business)->count(3)->create();

    $this->get(route('businesses.pages.index', $this->business))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Pages/Index')
            ->has('pages', 9)
        );
});

test('create renders create form', function () {
    $this->get(route('businesses.pages.create', $this->business))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Pages/Create'));
});

test('store creates a page and redirects', function () {
    $this->post(route('businesses.pages.store', $this->business), [
        'title' => 'Privacy Policy',
        'slug' => 'privacy-policy',
        'content' => '<p>Content here.</p>',
        'type' => 'privacy_policy',
        'is_published' => 0,
    ])->assertRedirect();

    expect(Page::where('title', 'Privacy Policy')->where('business_id', $this->business->id)->exists())->toBeTrue();
});

test('store auto-generates slug if omitted', function () {
    $this->post(route('businesses.pages.store', $this->business), [
        'title' => 'About Our Store',
        'content' => null,
        'type' => null,
        'is_published' => false,
    ])->assertRedirect();

    expect(
        Page::where('business_id', $this->business->id)
            ->where('title', 'About Our Store')
            ->first()
            ->slug
    )->toBe('about-our-store');
});

test('edit renders edit form', function () {
    $page = Page::factory()->for($this->business)->create();

    $this->get(route('businesses.pages.edit', [$this->business, $page]))
        ->assertOk()
        ->assertInertia(fn ($p) => $p
            ->component('Admin/Pages/Edit')
            ->has('page')
        );
});

test('update saves changes', function () {
    $page = Page::factory()->for($this->business)->create(['title' => 'Old Title']);

    $this->patch(route('businesses.pages.update', [$this->business, $page]), [
        'title' => 'New Title',
        'slug' => $page->slug,
    ])->assertRedirect();

    expect($page->fresh()->title)->toBe('New Title');
});

test('destroy deletes the page', function () {
    $page = Page::factory()->for($this->business)->create();

    $this->delete(route('businesses.pages.destroy', [$this->business, $page]))
        ->assertRedirect(route('businesses.pages.index', $this->business));

    expect(Page::find($page->id))->toBeNull();
});

test('togglePublish flips is_published', function () {
    $page = Page::factory()->for($this->business)->create(['is_published' => false]);

    $this->patch(route('businesses.pages.publish', [$this->business, $page]));

    expect($page->fresh()->is_published)->toBeTrue();
});

test('another user cannot access pages', function () {
    $other = User::factory()->create();
    actingAs($other);

    $this->get(route('businesses.pages.index', $this->business))->assertForbidden();
});
