// ─── Theme ───────────────────────────────────────────────────────────────────

export type ThemeId = 'classic' | 'boutique';

export interface ThemeSettings {
    primary_color?:     string;
    accent_color?:      string;
    bg_color?:          string;
    color_scheme?:      string;
    hero_image?:        string;
    show_featured?:     boolean;
    show_testimonials?: boolean;
    show_hero?:         boolean;
    show_shop_page?:    boolean;
    layout_style?:      'grid' | 'masonry' | 'list';
    products_per_page?: '12' | '24' | '36';
    [key: string]: unknown; // forward-compatible unknown keys
}

export type FieldType = 'color' | 'palette' | 'file' | 'boolean' | 'text' | 'select';

export interface SchemaField {
    type:         FieldType;
    label:        string;
    default?:     string | boolean;
    dimensions?:  string;   // for file fields e.g. '1920x1080'
    options?:     string[]; // for select fields
    placeholder?: string;
}

export type ThemeSchema = Record<string, SchemaField>;

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
    id:          number;
    business_id: number;
    name:        string;
    slug:        string;
    description: string | null;
    sort_order:  number;
}

// ─── Business ────────────────────────────────────────────────────────────────

export interface SocialLinks {
    instagram?: string;
    whatsapp?:  string;
    facebook?:  string;
    tiktok?:    string;
    twitter?:   string;
}

export type BusinessType = 'physical' | 'digital';
export type CustomerLoginMode = 'none' | 'checkout' | 'full';

export type BusinessCategory =
    | 'accessories' | 'automotive' | 'bakery' | 'beauty' | 'books'
    | 'crafts' | 'digital' | 'drinks' | 'education' | 'electronics'
    | 'fashion' | 'footwear' | 'furniture' | 'general' | 'groceries'
    | 'jewelry' | 'kids' | 'pharmacy' | 'phones' | 'photography'
    | 'restaurant' | 'sports';

export interface Business {
    id:                number;
    name:              string;
    slug:              string;
    is_active:         boolean;
    logo_url:          string | null;
    favicon_url:       string | null;
    tagline:           string | null;
    business_type:     BusinessType;
    business_category: BusinessCategory | null;
    description:       string | null;
    contact_email:     string | null;
    phone:             string | null;
    address:           string | null;
    website:           string | null;
    social_links:      SocialLinks;
    theme_id:          ThemeId;
    theme_settings:    ThemeSettings;
    meta_pixel_id:     string | null;
    ai_enabled:           boolean;
    customer_login_mode:  CustomerLoginMode;
    default_payment_provider: string | null;
    seo_title:         string | null;
    seo_description:   string | null;
    seo_image:         string | null;
    show_branding:     boolean;
    products?:         Product[];
    categories?:       Category[];
    pages?:            Page[];
    created_at:        string;
    updated_at:        string;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface ProductImage {
    id:         number;
    product_id: number;
    url:        string;
    alt?:       string;
    sort_order: number;
}

export interface ProductFile {
    id:        number;
    url:       string;
    filename:  string;
    file_size: number | null;
    mime_type: string | null;
}

export interface Product {
    id:          number;
    business_id: number;
    category_id: number | null;
    category:    { id: number; name: string; slug: string } | null;
    name:        string;
    slug:        string;
    description: string | null;
    price:       string; // decimal comes as string from Laravel
    stock:       number;
    is_active:   boolean;
    images:      ProductImage[];
    files:       ProductFile[];
    metadata:    Record<string, unknown>;
    created_at:  string;
    updated_at:  string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export type PageType = 'privacy_policy' | 'faq' | 'terms' | 'about' | 'shipping' | 'acceptable_use' | null;

export interface Page {
    id:           number;
    business_id:  number;
    title:        string;
    slug:         string;
    content:      string | null;
    type:         PageType;
    is_system:    boolean;
    is_published: boolean;
    sort_order:   number;
    created_at:   string;
    updated_at:   string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedData<T> {
    data:             T[];
    current_page:     number;
    last_page:        number;
    per_page:         number;
    total:            number;
    next_page_url:    string | null;
    prev_page_url:    string | null;
}

// ─── Customer Address ────────────────────────────────────────────────────────

export interface CustomerAddress {
    id:             number;
    customer_id:    number;
    label:          string;
    street_address: string;
    city:           string;
    region:         string | null;
    country:        string;
    is_default:     boolean;
    created_at:     string;
    updated_at:     string;
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
    id:          number;
    business_id: number;
    name:        string;
    email:       string | null;
    phone:       string | null;
    notes:       string | null;
    created_at:  string;
    updated_at:  string;
}

/** The authenticated customer shared via Inertia's auth.customer prop */
export interface AuthenticatedCustomer {
    id:         number;
    name:       string;
    email:      string | null;
    phone:      string | null;
    avatar:     string | null;
    google_id:  string | null;
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
    order_id:         string | null;
    business_id:      number;
    customer_id:      number | null;
    customer:         Customer | null;
    customer_name:    string | null;
    customer_email:   string | null;
    customer_phone:   string | null;
    total:            string;
    currency:         string;
    status:           OrderStatus;
    payment_ref:      string | null;
    payment_provider: string | null;
    source:           OrderSource;
    paid_at:          string | null;
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
