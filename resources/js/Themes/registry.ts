import { lazy, type ComponentType } from 'react';
import { ClassicSchema } from './Classic/schema';
import { BoutiqueSchema } from './Boutique/schema';
import { CourseFunnelSchema } from './CourseFunnel/schema';

// ─── ADD NEW THEMES HERE ONLY ────────────────────────────────────────────────
// After creating your theme's index.ts + schema.ts, add one entry below.
// Set active: false while the theme is in development — it won't appear in the
// dashboard picker, but existing stores using it will still render correctly.

const THEMES = {
    classic: {
        label: 'Classic',
        description: 'Clean, versatile layout. Works for any product category.',
        schema: ClassicSchema,
        load: () => import('./Classic'),
        active: true,
    },
    boutique: {
        label: 'Boutique',
        description:
            'Editorial, fashion-forward. Perfect for clothing & lifestyle.',
        schema: BoutiqueSchema,
        load: () => import('./Boutique'),
        active: false,
    },
    'course-funnel': {
        label:         'Course Funnel',
        description:   'Single-product sales page. Perfect for ebooks, courses, and digital downloads.',
        schema:        CourseFunnelSchema,
        productFields: {
            promo_video: {
                type:  'video' as const,
                label: 'Demo Video',
                hint:  'Optional walkthrough video shown on your sales page. Upload an MP4/WebM or paste a YouTube/Vimeo URL.',
            },
        },
        load:   () => import('./CourseFunnel'),
        active: true,
    },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemeId = keyof typeof THEMES;

export type ThemeRegistry = Record<string, ComponentType<any>>;

export interface ProductFieldDefinition {
    type:  'video' | 'text' | 'boolean';
    label: string;
    hint?: string;
}

export type ProductFields = Record<string, ProductFieldDefinition>;

// ─── Derived exports — nothing to touch below when adding a theme ─────────────

/**
 * Schema map — drives the auto-generated settings form in the dashboard.
 * Includes all themes regardless of active flag so existing stores always
 * have their settings page available.
 */
export const SCHEMA_MAP = Object.fromEntries(
    (Object.keys(THEMES) as ThemeId[]).map((id) => [id, THEMES[id].schema]),
) as { [K in ThemeId]: (typeof THEMES)[K]['schema'] };

/**
 * Flat list for the ThemePicker UI.
 * Only includes active themes — inactive themes are hidden from selection.
 */
export const THEME_LIST = (Object.keys(THEMES) as ThemeId[])
    .filter((id) => THEMES[id].active)
    .map((id) => ({
        id,
        label: THEMES[id].label,
        description: THEMES[id].description,
    }));

// ─── Code-split theme map ─────────────────────────────────────────────────────

function createThemeLazy(
    loader: () => Promise<{ default: ThemeRegistry }>,
): ThemeRegistry {
    let shared: Promise<{ default: ThemeRegistry }> | null = null;

    const load = () => {
        if (!shared) {
            shared = loader();
            // Pre-fill cache with raw components once the chunk lands.
            // Subsequent navigations skip Suspense entirely — no white flash.
            shared.then((m) => {
                for (const key of Object.keys(m.default)) {
                    cache.set(key, m.default[key]);
                }
            });
        }
        return shared;
    };

    const cache = new Map<string, ComponentType<any>>();

    return new Proxy({} as ThemeRegistry, {
        get(_target, key: string) {
            if (cache.has(key)) return cache.get(key);
            return lazy(() =>
                load().then((m) => {
                    const Component = m.default[key];
                    if (!Component) {
                        throw new Error(
                            `Theme does not export a "${key}" component`,
                        );
                    }
                    return { default: Component };
                }),
            );
        },
        has() {
            return true;
        },
    });
}

/**
 * Returns the theme-specific product field extensions for the given theme id.
 * Returns an empty object when the theme declares no extensions.
 */
export function getProductFields(themeId: string): ProductFields {
    const theme = THEMES[themeId as ThemeId];
    return (theme as { productFields?: ProductFields })?.productFields ?? {};
}

/**
 * Code-split theme component map.
 * Includes ALL themes (active or not) — a store already using an inactive
 * theme must still render correctly on the storefront.
 */
export const THEME_MAP: Record<string, ThemeRegistry> = Object.fromEntries(
    (Object.keys(THEMES) as ThemeId[]).map((id) => [
        id,
        createThemeLazy(THEMES[id].load),
    ]),
);
