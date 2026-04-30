/**
 * Industry-anchored color presets.
 *
 * Each preset is inspired by category-defining brands so non-designer shop
 * owners can pick by industry rather than by color theory. The picker UI
 * surfaces `reference` as a tooltip on hover.
 *
 * Three brand inputs per preset (primary, highlight, surface). The casting
 * director in Themes/Shared/Tokens/ maps these to ~10 semantic UI roles.
 * Components NEVER consume these directly -- always go through useSemanticTokens.
 */

export interface ColorPalette {
    id:        string;
    name:      string;
    reference: string;
    primary:   string;
    highlight: string;
    surface:   string;
}

export const PALETTES: ColorPalette[] = [
    { id: 'luxe',     name: 'Luxe',     reference: 'Dior, Chanel',        primary: '#0a0a0a', highlight: '#c9a961', surface: '#faf8f5' },
    { id: 'beauty',   name: 'Beauty',   reference: 'Sephora, Glossier',   primary: '#1a1a1a', highlight: '#e8a4b8', surface: '#fdf6f4' },
    { id: 'fresh',    name: 'Fresh',    reference: 'Whole Foods',         primary: '#1f3d2b', highlight: '#7cb342', surface: '#f4faf3' },
    { id: 'bold',     name: 'Bold',     reference: 'Coca-Cola, Supreme',  primary: '#c41e3a', highlight: '#ffd700', surface: '#fffaf0' },
    { id: 'tech',     name: 'Tech',     reference: 'Apple, Samsung',      primary: '#1d1d1f', highlight: '#0071e3', surface: '#f5f5f7' },
    { id: 'wellness', name: 'Wellness', reference: 'Lululemon, Nike Fit', primary: '#2d4a3e', highlight: '#ff6b35', surface: '#f7f9f7' },
    { id: 'cafe',     name: 'Cafe',     reference: 'Starbucks',           primary: '#3e2723', highlight: '#d4a574', surface: '#faf6f1' },
    { id: 'royal',    name: 'Royal',    reference: 'African heritage',    primary: '#5d1f1f', highlight: '#daa520', surface: '#fdf8f0' },
    { id: 'minimal',  name: 'Minimal',  reference: 'Muji, Aesop',         primary: '#1a1a1a', highlight: '#737373', surface: '#fafafa' },
];

/**
 * Default palette used by useSemanticTokens when a business has missing or
 * stale color keys. Minimal is chosen because it's neutral and safe across
 * any storefront content.
 */
export const DEFAULT_PALETTE: ColorPalette = PALETTES[8]!;
