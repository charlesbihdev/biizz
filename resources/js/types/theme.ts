import { lazy, type ComponentType } from 'react';
import { ClassicSchema }  from '@/Themes/Classic/schema';
import { BoutiqueSchema } from '@/Themes/Boutique/schema';

/**
 * Master schema map — the Admin Dashboard reads this to auto-generate its UI.
 * Adding a new theme: import its schema here and add one entry. Nothing else changes.
 */
export const SCHEMA_MAP = {
    classic:  ClassicSchema,
    boutique: BoutiqueSchema,
} as const;

export type ThemeId = keyof typeof SCHEMA_MAP;

/**
 * Theme registry shape — every theme must export this set of page components.
 */
export interface ThemeRegistry {
    Layout:   ComponentType<any>;
    Shop:     ComponentType<any>;
    Product:  ComponentType<any>;
    Checkout: ComponentType<any>;
    Contact:  ComponentType<any>;
    Page:     ComponentType<any>;
}

/**
 * Code-split theme map.
 *
 * Each page × theme is a lazy component. Vite deduplicates the dynamic import
 * so all six entries for a single theme resolve to ONE chunk.
 * A visitor to a Classic store never downloads Boutique code.
 */
export const THEME_MAP = {
    classic: {
        Layout:   lazy(() => import('@/Themes/Classic').then(m => ({ default: m.default.Layout }))),
        Shop:     lazy(() => import('@/Themes/Classic').then(m => ({ default: m.default.Shop }))),
        Product:  lazy(() => import('@/Themes/Classic').then(m => ({ default: m.default.Product }))),
        Checkout: lazy(() => import('@/Themes/Classic').then(m => ({ default: m.default.Checkout }))),
        Contact:  lazy(() => import('@/Themes/Classic').then(m => ({ default: m.default.Contact }))),
        Page:     lazy(() => import('@/Themes/Classic').then(m => ({ default: m.default.Page }))),
    },
    boutique: {
        Layout:   lazy(() => import('@/Themes/Boutique').then(m => ({ default: m.default.Layout }))),
        Shop:     lazy(() => import('@/Themes/Boutique').then(m => ({ default: m.default.Shop }))),
        Product:  lazy(() => import('@/Themes/Boutique').then(m => ({ default: m.default.Product }))),
        Checkout: lazy(() => import('@/Themes/Boutique').then(m => ({ default: m.default.Checkout }))),
        Contact:  lazy(() => import('@/Themes/Boutique').then(m => ({ default: m.default.Contact }))),
        Page:     lazy(() => import('@/Themes/Boutique').then(m => ({ default: m.default.Page }))),
    },
} as const;
