<?php

use Inertia\Testing\AssertableInertia;

test('features page is publicly accessible', function () {
    $this->get(route('features'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('features'));
});
