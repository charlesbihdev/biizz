import type { ThemeSchema } from '@/types/business';

export const BoutiqueSchema: ThemeSchema = {
    hero_image: {
        type:       'file',
        label:      'Main Banner',
        dimensions: '1920x1080',
    },
    accent_color: {
        type:    'color',
        label:   'Primary Brand Color',
        default: '#000000',
    },
    store_tagline: {
        type:        'text',
        label:       'Store Tagline',
        placeholder: 'Your brand statement',
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
    whatsapp_number: {
        type:        'text',
        label:       'WhatsApp Contact Number',
        placeholder: '+233 XX XXX XXXX',
    },
};
