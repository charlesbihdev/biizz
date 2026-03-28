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
 * Build lazy components from a theme's exports, sharing a single import promise.
 *
 * Uses a Proxy so theme.ts never hardcodes which components a theme has.
 * The theme's index.ts is the sole source of truth.
 *
 * On the FIRST access of any component, the chunk downloads and the shared
 * promise caches it. All subsequent accesses (Layout, Shop, Product, etc.)
 * resolve instantly from the same cached promise — no Suspense fallback flash.
 *
 * A visitor to a Classic store never downloads Boutique code, and vice-versa.
 */
function createThemeLazy(
    loader: () => Promise<{ default: ThemeRegistry }>,
): ThemeRegistry {
    let shared: Promise<{ default: ThemeRegistry }> | null = null;
    const load = () => (shared ??= loader());

    // Cache lazy wrappers so the same key always returns the same component ref
    const cache = new Map<string, ComponentType<any>>();

    return new Proxy({} as ThemeRegistry, {
        get(_target, key: string) {
            if (cache.has(key)) return cache.get(key);

            const wrapper = lazy(() =>
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

            cache.set(key, wrapper);
            return wrapper;
        },

        has() {
            return true; // let optional chaining work — the lazy wrapper handles missing keys at resolve time
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
