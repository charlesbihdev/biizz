<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Regex;
use Spatie\LaravelData\Data;

/**
 * Typed DTO for the businesses.theme_settings jsonb column.
 *
 * This class is the gatekeeper — no raw array ever reaches the jsonb column.
 * All theme schema fields across Classic and Boutique themes are represented here.
 * When a new theme is added, add its new fields to this class.
 */
class ThemeSettingsData extends Data
{
    public function __construct(
        // Color fields
        #[Regex('/^#[0-9A-Fa-f]{6}$/')]
        public readonly ?string $primary_color = null,

        #[Regex('/^#[0-9A-Fa-f]{6}$/')]
        public readonly ?string $accent_color = null,

        // Image fields (stored as relative path after upload)
        #[Max(2048)]
        public readonly ?string $hero_image = null,

        // Boolean toggles
        public readonly bool $show_featured = true,
        public readonly bool $show_testimonials = true,

        // Text fields
        #[Max(120)]
        public readonly ?string $store_tagline = null,

        // Select fields
        public readonly ?string $layout_style = null,

        // Store info
        #[Max(500)]
        public readonly ?string $store_description = null,

        #[Max(255)]
        public readonly ?string $store_address = null,

        #[Max(100)]
        public readonly ?string $whatsapp_number = null,
    ) {}
}
