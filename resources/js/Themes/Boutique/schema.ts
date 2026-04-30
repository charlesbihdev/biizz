import type { ThemeSchema } from '@/types/business';

/**
 * Boutique theme schema.
 *
 * Logo, tagline, WhatsApp, address, and description live in Business Settings,
 * not here — they are shared across all themes.
 */
export const BoutiqueSchema: ThemeSchema = {
    hero_image: {
        type:       'file',
        label:      'Main Banner',
        dimensions: '1920x1080',
    },
    highlight_color: {
        type:    'color',
        label:   'Primary Brand Color',
        default: '#000000',
    },
    show_testimonials: {
        type:    'boolean',
        label:   'Display Customer Reviews',
        default: true,
    },
    layout_style: {
        type:    'select',
        label:   'Product Grid Layout',
        options: ['grid', 'masonry', 'list'],
        default: 'grid',
    },
};
