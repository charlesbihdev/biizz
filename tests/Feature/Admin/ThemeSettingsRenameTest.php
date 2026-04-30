<?php

use App\Models\Business;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user     = User::factory()->create();
    $this->business = Business::factory()->for($this->user, 'owner')->create();
    actingAs($this->user);
});

test('update accepts new color keys highlight_color and surface_color', function () {
    $this->patch(route('businesses.theme.update', $this->business), [
        'primary_color'   => '#0a0a0a',
        'highlight_color' => '#c9a961',
        'surface_color'   => '#faf8f5',
        'color_scheme'    => 'luxe',
    ])->assertRedirect();

    $this->business->refresh();
    expect($this->business->theme_settings['primary_color'])->toBe('#0a0a0a');
    expect($this->business->theme_settings['highlight_color'])->toBe('#c9a961');
    expect($this->business->theme_settings['surface_color'])->toBe('#faf8f5');
    expect($this->business->theme_settings['color_scheme'])->toBe('luxe');
});

test('update silently drops the old accent_color and bg_color keys', function () {
    // Old keys are no longer in the Form Request rules nor the DTO,
    // so they should be ignored without a validation error.
    $this->patch(route('businesses.theme.update', $this->business), [
        'primary_color' => '#0a0a0a',
        'accent_color'  => '#c9a961',
        'bg_color'      => '#faf8f5',
    ])->assertRedirect();

    $this->business->refresh();
    expect($this->business->theme_settings)->not->toHaveKey('accent_color');
    expect($this->business->theme_settings)->not->toHaveKey('bg_color');
    expect($this->business->theme_settings['primary_color'])->toBe('#0a0a0a');
});

test('update rejects malformed hex values for new color keys', function () {
    $this->patch(route('businesses.theme.update', $this->business), [
        'highlight_color' => 'not-a-hex',
    ])->assertSessionHasErrors('highlight_color');

    $this->patch(route('businesses.theme.update', $this->business), [
        'surface_color' => '#xyz',
    ])->assertSessionHasErrors('surface_color');
});
