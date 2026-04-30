import type { ThemeSchema } from '@/types/business';

export const CourseFunnelSchema: ThemeSchema = {
    highlight_color: {
        type:    'color',
        label:   'Brand Accent Color',
        default: '#6366f1',
    },
    cta_text: {
        type:        'text',
        label:       'Buy Button Text',
        placeholder: 'Get Instant Access',
    },
    whatsapp_number: {
        type:        'text',
        label:       'Your WhatsApp number (include country code, e.g. 233244000000)',
        placeholder: '233244000000',
    },
    enable_whatsapp_cta: {
        type:    'boolean',
        label:   'Enable WhatsApp order button',
        default: true,
    },
    enable_payment_cta: {
        type:    'boolean',
        label:   'Enable payment checkout button',
        default: false,
    },
    catalog_mode: {
        type:    'boolean',
        label:   'Catalog mode — show all your products on the homepage so customers can browse and pick what they want (ideal if you sell multiple books or courses)',
        default: false,
    },
    featured_product_id: {
        type:  'product',
        label: 'Featured Product — shown on the homepage when catalog mode is off',
    },
};
