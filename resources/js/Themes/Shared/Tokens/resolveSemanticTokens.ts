import {
    darken,
    ensureContrast,
    ensureContrastHsl,
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
 *   - `highlightStrong` matches retail sale-chip aesthetics:
 *       - For LIGHT highlights (luminance > 0.5: yellow, pastel pink) -> raw highlight,
 *         near-black text. Classic "Caution"/Sephora-style bright chip with dark text.
 *       - For MEDIUM/DARK highlights (gold, brown, blue, green, grey) -> white text on
 *         either raw highlight (Tech blue, Minimal grey already dark enough) or an
 *         HSL-deepened version (gold/brown/orange need a slight darken so white reads).
 *   - `highlightStrongFg` is auto-picked via `pickContrastingForeground` -- the threshold
 *     above guarantees the picked fg has >= 4.5 contrast against the chip bg.
 */
export interface SemanticTokens {
    surface:           string;
    surfaceRaised:     string;
    textPrimary:       string;
    textMuted:         string;
    border:            string;
    ctaBg:             string;
    ctaFg:             string;
    ctaBgHover:        string;
    highlightSoft:     string;
    highlightStrong:   string;
    highlightStrongFg: string;
    price:             string;
}

const HOVER_SHIFT = 0.08;
const SURFACE_RAISED_SHIFT = 0.04;
const TEXT_CONTRAST_TARGET = 7;
// Above this luminance we treat the highlight as "light" and put near-black text on it
// (Bold yellow, Beauty pastel pink). Below this we use white text and HSL-darken if needed.
const LIGHT_HIGHLIGHT_LUMINANCE = 0.5;
// White text on chip needs >= 4.5 against the chip bg (WCAG AA normal text).
const WHITE_TEXT_CONTRAST_TARGET = 4.5;

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

    // Light highlights stay raw and pair with near-black text (warm chip aesthetic).
    // Medium/dark highlights take white text -- raw if already dark enough, deepened otherwise.
    const highlightIsLight = relativeLuminance(highlight) > LIGHT_HIGHLIGHT_LUMINANCE;
    const highlightStrong = highlightIsLight
        ? highlight
        : ensureContrastHsl(highlight, '#ffffff', WHITE_TEXT_CONTRAST_TARGET);
    const highlightStrongFg = pickContrastingForeground(highlightStrong);

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
        highlightStrongFg,
        price: textPrimary,
    };
}
