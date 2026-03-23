// ─── Theme ───────────────────────────────────────────────────────────────────

export type ThemeId = 'classic' | 'boutique';

export interface ThemeSettings {
    primary_color?:     string;
    accent_color?:      string;
    hero_image?:        string;
    show_featured?:     boolean;
    show_testimonials?: boolean;
    store_tagline?:     string;
    layout_style?:      'grid' | 'masonry' | 'list';
    store_description?: string;
    store_address?:     string;
    whatsapp_number?:   string;
    [key: string]: unknown; // forward-compatible unknown keys
}

export type FieldType = 'color' | 'file' | 'boolean' | 'text' | 'select';

export interface SchemaField {
    type:         FieldType;
    label:        string;
    default?:     string | boolean;
    dimensions?:  string;   // for file fields e.g. '1920x1080'
    options?:     string[]; // for select fields
    placeholder?: string;
}

export type ThemeSchema = Record<string, SchemaField>;

// ─── Business ────────────────────────────────────────────────────────────────

export interface SocialLinks {
    instagram?: string;
    whatsapp?:  string;
    facebook?:  string;
    tiktok?:    string;
    twitter?:   string;
}

export interface Business {
    id:              number;
    name:            string;
    slug:            string;
    is_active:       boolean;
    description:     string | null;
    contact_email:   string | null;
    phone:           string | null;
    address:         string | null;
    website:         string | null;
    social_links:    SocialLinks;
    theme_id:        ThemeId;
    theme_settings:  ThemeSettings;
    meta_pixel_id:   string | null;
    ai_enabled:      boolean;
    has_paystack:    boolean;
    has_junipay:     boolean;
    products?:       Product[];
    created_at:      string;
    updated_at:      string;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface ProductImage {
    url:   string;
    alt?:  string;
    order?: number;
}

export interface Product {
    id:          number;
    business_id: number;
    category_id: number | null;
    category:    { id: number; name: string } | null;
    name:        string;
    description: string | null;
    price:       string; // decimal comes as string from Laravel
    stock:       number;
    is_active:   boolean;
    images:      ProductImage[];
    metadata:    Record<string, unknown>;
    created_at:  string;
    updated_at:  string;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';
export type OrderSource = 'storefront' | 'whatsapp' | 'instagram';

export interface OrderItem {
    id:           number;
    order_id:     number;
    product_id:   number;
    product_name: string;
    unit_price:   string;
    quantity:     number;
    subtotal:     string;
}

export interface Order {
    id:               number;
    business_id:      number;
    customer_name:    string | null;
    customer_email:   string | null;
    customer_phone:   string | null;
    total:            string;
    currency:         string;
    status:           OrderStatus;
    payment_ref:      string | null;
    payment_provider: string | null;
    source:           OrderSource;
    items?:           OrderItem[];
    created_at:       string;
    updated_at:       string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
    id:       number;
    name:     string;
    price:    number;
    quantity: number;
    image?:   string;
}
