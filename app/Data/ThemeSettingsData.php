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

        #[Regex('/^#[0-9A-Fa-f]{6}$/')]
        public readonly ?string $bg_color = null,

        // Color preset identifier (e.g. 'midnight', 'forest')
        #[Max(50)]
        public readonly ?string $color_scheme = null,

        // Image fields
        #[Max(2048)]
        public readonly ?string $hero_image = null,

        // Boolean toggles (Classic / shared)
        public readonly bool $show_featured = true,
        public readonly bool $show_testimonials = true,
        public readonly bool $show_hero = true,
        public readonly bool $show_shop_page = true,

        // Select fields
        public readonly ?string $layout_style = null,

        #[In(['12', '24', '36'])]
        public readonly string $products_per_page = '24',

        // Course Funnel fields
        #[Max(150)]
        public readonly ?string $hero_headline = null,

        #[Max(300)]
        public readonly ?string $hero_subheadline = null,

        #[Max(50)]
        public readonly ?string $cta_text = null,

        #[Max(2048)]
        public readonly ?string $promo_video = null,

        #[Max(30)]
        public readonly ?string $whatsapp_number = null,

        public readonly bool $enable_whatsapp_cta = true,
        public readonly bool $enable_payment_cta = false,
        public readonly bool $catalog_mode = false,
        public readonly ?int $featured_product_id = null,
        public readonly ?string $sales_content = null,
    ) {}
}
