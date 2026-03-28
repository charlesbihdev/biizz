import { lazy, type ComponentType } from 'react';
import { ClassicSchema } from '@/Themes/Classic/schema';
import { BoutiqueSchema } from '@/Themes/Boutique/schema';

/**
 * Master schema map — the Admin Dashboard reads this to auto-generate its UI.
 * Adding a new theme: import its schema here and add one entry. Nothing else changes.
 */
export const SCHEMA_MAP = {
    classic: ClassicSchema,
    boutique: BoutiqueSchema,
} as const;

export type ThemeId = keyof typeof SCHEMA_MAP;

/**
 * A theme registry is just a map of component names to components.
 * Each theme's index.ts defines what it exports — no enforced shape here.
 */
export type ThemeRegistry = Record<string, ComponentType<any>>;

/**
 * Build a code-split theme entry using a Proxy.
 *
 * Uses a Proxy so theme.ts never hardcodes which components a theme has.
 * The theme's index.ts is the sole source of truth.
 *
 * - BEFORE the chunk loads: returns a React.lazy() wrapper (first page load
 *   goes through Suspense once — unavoidable, the code needs to download).
 * - AFTER the chunk loads: caches every component the theme exports as raw
 *   components (no lazy wrapper). Subsequent navigations skip Suspense
 *   entirely — no white flash.
 *
 * A visitor to a Classic store never downloads Boutique code, and vice-versa.
 */
function createThemeLazy(
    loader: () => Promise<{ default: ThemeRegistry }>,
): ThemeRegistry {
    let shared: Promise<{ default: ThemeRegistry }> | null = null;

    const load = () => {
        if (!shared) {
            shared = loader();
            // Once the chunk downloads, pre-fill cache with raw components
            // for every key the theme exports. No lazy wrapper = no Suspense.
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
            // Already loaded — return raw component, no lazy, no Suspense
            if (cache.has(key)) return cache.get(key);

            // Not loaded yet — return a lazy wrapper that triggers the download
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
 * Code-split theme map.
 *
 * Each theme is one chunk. The first component rendered triggers the
 * shared import, which pre-resolves all sibling lazy wrappers in that
 * theme. No loading flash on subsequent page navigations.
 */
export const THEME_MAP: Record<string, ThemeRegistry> = {
    classic: createThemeLazy(() => import('@/Themes/Classic')),
    boutique: createThemeLazy(() => import('@/Themes/Boutique')),
};
