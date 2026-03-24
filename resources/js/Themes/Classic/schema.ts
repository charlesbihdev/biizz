import type { ThemeSchema } from '@/types/business';

/**
 * Classic theme schema — the single source of truth for what this theme accepts.
 *
 * The Admin Dashboard reads this schema to auto-generate its UI controls.
 * Nothing is hardcoded in the UI — if it's not here, it won't appear.
 *
 * Logo, tagline, WhatsApp, address, and description live in Business Settings,
 * not here — they are shared across all themes.
 */
export const ClassicSchema: ThemeSchema = {
    color_scheme: {
        type:  'palette',
        label: 'Brand Color Scheme',
    },
    hero_image: {
        type:       'file',
        label:      'Hero Banner Image',
        dimensions: '1920x600',
    },
    show_hero: {
        type:    'boolean',
        label:   'Show Hero Banner',
        default: true,
    },
    products_per_page: {
        type:    'select',
        label:   'Products per page',
        options: ['12', '24', '36'],
        default: '24',
    },
    show_featured: {
        type:    'boolean',
        label:   'Show Featured Products Section',
        default: true,
    },
};
