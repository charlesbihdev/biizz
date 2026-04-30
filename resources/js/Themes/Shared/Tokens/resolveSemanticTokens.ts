import {
    contrastRatio,
    darken,
    ensureContrast,
    lighten,
    mix,
    pickContrastingForeground,
    relativeLuminance,
    withAlpha,
} from './contrast';

/**
 * Brand input: the three colors a shop owner picks (preset or custom).
 */
export interface BrandColors {
    primary:   string;
    highlight: string;
    surface:   string;
}

/**
 * Semantic role tokens consumed by theme components.
 *
 * Themes consume these via the useSemanticTokens hook. Components NEVER
 * read `theme_settings.primary_color` etc directly -- the resolver below
 * is the single bridge between brand input and UI roles.
 *
 * Some roles are locked by design:
 *   - `price` is permanently `textPrimary`. Prices are never themed.
 *   - `highlightStrong` falls back to primary when contrast is too low,
 *     so badges/tags never become invisible.
 */
export interface SemanticTokens {
    surface:         string;
    surfaceRaised:   string;
    textPrimary:     string;
    textMuted:       string;
    border:          string;
    ctaBg:           string;
    ctaFg:           string;
    ctaBgHover:      string;
    highlightSoft:   string;
    highlightStrong: string;
    price:           string;
}

const HOVER_SHIFT = 0.08;
const SURFACE_RAISED_SHIFT = 0.04;
const TEXT_CONTRAST_TARGET = 7;
const HIGHLIGHT_CONTRAST_TARGET = 4.5;

/**
 * Pure function: same brand input -> same semantic tokens, every time.
 *
 * No randomness, no Date, no browser APIs. Determinism is contract, see
 * Phase 2 hard guarantees in the plan.
 */
export function resolveSemanticTokens({ primary, highlight, surface }: BrandColors): SemanticTokens {
    const surfaceIsDark = relativeLuminance(surface) < 0.5;

    const surfaceRaised = surfaceIsDark
        ? lighten(surface, SURFACE_RAISED_SHIFT)
        : darken(mix(surface, primary, SURFACE_RAISED_SHIFT), 0);

    const textPrimary = ensureContrast(
        primary,
        surface,
        TEXT_CONTRAST_TARGET,
        surfaceIsDark ? '#ffffff' : '#0a0a0a',
    );

    const ctaBg = primary;
    const ctaFg = pickContrastingForeground(primary);
    const primaryIsVeryDark = relativeLuminance(primary) < 0.1;
    const ctaBgHover = primaryIsVeryDark
        ? lighten(primary, HOVER_SHIFT)
        : darken(primary, HOVER_SHIFT);

    const highlightStrong = contrastRatio(highlight, surface) >= HIGHLIGHT_CONTRAST_TARGET
        ? highlight
        : primary;

    return {
        surface,
        surfaceRaised,
        textPrimary,
        textMuted: withAlpha(textPrimary, 0.65),
        border: withAlpha(textPrimary, 0.12),
        ctaBg,
        ctaFg,
        ctaBgHover,
        highlightSoft: withAlpha(highlight, 0.12),
        highlightStrong,
        price: textPrimary,
    };
}
