import type { ThemeSchema } from '@/types/business';

/**
 * Classic theme schema — the single source of truth for what this theme accepts.
 *
 * The Admin Dashboard reads this schema to auto-generate its UI controls.
 * Nothing is hardcoded in the UI — if it's not here, it won't appear.
 */
export const ClassicSchema: ThemeSchema = {
    primary_color: {
        type:    'color',
        label:   'Primary Brand Color',
        default: '#1a1a1a',
    },
    hero_image: {
        type:       'file',
        label:      'Hero Banner Image',
        dimensions: '1920x600',
    },
    store_tagline: {
        type:        'text',
        label:       'Store Tagline',
        default:     'Welcome to our store',
        placeholder: 'e.g. Quality goods, delivered fast',
    },
    show_featured: {
        type:    'boolean',
        label:   'Show Featured Products Section',
        default: true,
    },
    store_description: {
        type:        'text',
        label:       'About Your Store',
        placeholder: 'Tell customers what you sell...',
    },
    store_address: {
        type:        'text',
        label:       'Store Address / Location',
        placeholder: 'e.g. Accra Mall, Ground Floor',
    },
    whatsapp_number: {
        type:        'text',
        label:       'WhatsApp Contact Number',
        placeholder: '+233 XX XXX XXXX',
    },
};
