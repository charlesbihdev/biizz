<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\In;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Regex;
use Spatie\LaravelData\Data;

/**
 * Typed DTO for the businesses.theme_settings jsonb column.
 *
 * This class is the gatekeeper — no raw array ever reaches the jsonb column.
 * Logo, tagline, WhatsApp, address, and description live on the Business model itself,
 * not here — they are shared across all themes.
 */
class ThemeSettingsData extends Data
{
    public function __construct(
        // Color fields
        #[Regex('/^#[0-9A-Fa-f]{6}$/')]
        public readonly ?string $primary_color = null,

        #[Regex('/^#[0-9A-Fa-f]{6}$/')]
        public readonly ?string $accent_color = null,

        // Color preset identifier (e.g. 'midnight', 'forest')
        #[Max(50)]
        public readonly ?string $color_scheme = null,

        // Image fields
        #[Max(2048)]
        public readonly ?string $hero_image = null,

        // Boolean toggles
        public readonly bool $show_featured = true,
        public readonly bool $show_testimonials = true,
        public readonly bool $show_hero = true,

        // Select fields
        public readonly ?string $layout_style = null,

        #[In(['12', '24', '36'])]
        public readonly string $products_per_page = '24',
    ) {}
}
