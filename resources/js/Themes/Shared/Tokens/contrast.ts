/**
 * WCAG 2.1 contrast utilities + deterministic HSL color math.
 *
 * Every export is a pure function: same input -> same output, always.
 * No randomness, no Date, no browser APIs, no environment lookups.
 * Tests in __tests__/ lock this contract.
 */

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

const NEAR_BLACK = '#0a0a0a';
const NEAR_WHITE = '#ffffff';

// ── hex parsing ──

function parseHex(hex: string): RGB {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r, g, b };
}

function toHex({ r, g, b }: RGB): string {
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    const pad = (v: number) => clamp(v).toString(16).padStart(2, '0');
    return `#${pad(r)}${pad(g)}${pad(b)}`;
}

// ── HSL <-> RGB (deterministic) ──

function rgbToHsl({ r, g, b }: RGB): HSL {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
            case gn: h = (bn - rn) / d + 2; break;
            case bn: h = (rn - gn) / d + 4; break;
        }
        h /= 6;
    }
    return { h, s, l };
}

function hslToRgb({ h, s, l }: HSL): RGB {
    if (s === 0) {
        const v = l * 255;
        return { r: v, g: v, b: v };
    }
    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) { t += 1; }
        if (t > 1) { t -= 1; }
        if (t < 1 / 6) { return p + (q - p) * 6 * t; }
        if (t < 1 / 2) { return q; }
        if (t < 2 / 3) { return p + (q - p) * (2 / 3 - t) * 6; }
        return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return {
        r: hue2rgb(p, q, h + 1 / 3) * 255,
        g: hue2rgb(p, q, h) * 255,
        b: hue2rgb(p, q, h - 1 / 3) * 255,
    };
}

// ── WCAG 2.1 luminance + contrast ──

function channelLuminance(c: number): number {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
    const { r, g, b } = parseHex(hex);
    return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/**
 * WCAG contrast ratio. Returns 1 (no contrast) to 21 (white vs black).
 * AA passes at >= 4.5 for normal text, >= 3 for large text / non-text.
 */
export function contrastRatio(a: string, b: string): number {
    const la = relativeLuminance(a);
    const lb = relativeLuminance(b);
    const lighter = Math.max(la, lb);
    const darker = Math.min(la, lb);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Return near-white if bg is dark, near-black if bg is light.
 * Used for CTA foreground when the user picks an arbitrary primary.
 */
export function pickContrastingForeground(bg: string): string {
    return contrastRatio(bg, NEAR_WHITE) >= contrastRatio(bg, NEAR_BLACK)
        ? NEAR_WHITE
        : NEAR_BLACK;
}

// ── color manipulation (deterministic) ──

/** Subtract `amount` (0-1) from L channel. Clamps to [0, 1]. */
export function darken(hex: string, amount: number): string {
    const hsl = rgbToHsl(parseHex(hex));
    const next: HSL = { ...hsl, l: Math.max(0, hsl.l - amount) };
    return toHex(hslToRgb(next));
}

/** Add `amount` (0-1) to L channel. Clamps to [0, 1]. */
export function lighten(hex: string, amount: number): string {
    const hsl = rgbToHsl(parseHex(hex));
    const next: HSL = { ...hsl, l: Math.min(1, hsl.l + amount) };
    return toHex(hslToRgb(next));
}

/** Linear RGB mix. ratio=0 returns a, ratio=1 returns b. */
export function mix(a: string, b: string, ratio: number): string {
    const ca = parseHex(a);
    const cb = parseHex(b);
    const t = Math.max(0, Math.min(1, ratio));
    return toHex({
        r: ca.r * (1 - t) + cb.r * t,
        g: ca.g * (1 - t) + cb.g * t,
        b: ca.b * (1 - t) + cb.b * t,
    });
}

/**
 * Append an alpha to a hex color as 8-digit hex.
 * `alpha` is 0-1. Used for soft fills (highlightSoft) where opacity is the desired effect.
 */
export function withAlpha(hex: string, alpha: number): string {
    const a = Math.max(0, Math.min(1, alpha));
    const byte = Math.round(a * 255).toString(16).padStart(2, '0');
    return `${hex}${byte}`;
}

/**
 * Iteratively step `color` toward `target` until contrast against `against` >= `minRatio`.
 * Deterministic: fixed step size, hard iteration cap. If unreachable, returns the closest attempt.
 */
export function ensureContrast(
    color: string,
    against: string,
    minRatio: number,
    target: string = NEAR_BLACK,
): string {
    let current = color;
    const STEP = 0.04;
    const MAX_ITERATIONS = 25;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
        if (contrastRatio(current, against) >= minRatio) {
            return current;
        }
        current = mix(current, target, STEP);
    }
    return current;
}

/**
 * Like `ensureContrast`, but adjusts the L channel only -- preserves hue + saturation.
 * Direction is chosen by `against`'s luminance: darken if surface is light, lighten if dark.
 *
 * Used for `highlightStrong` so the user's chosen hue (gold, pink, green) stays recognizable
 * while becoming visible against the surface, instead of falling back to primary.
 *
 * Deterministic: fixed step, hard iteration cap.
 */
export function ensureContrastHsl(color: string, against: string, minRatio: number): string {
    const { h, s, l: startL } = rgbToHsl(parseHex(color));
    const direction = relativeLuminance(against) > 0.5 ? -1 : 1;
    const STEP = 0.04;
    const MAX_ITERATIONS = 25;
    let l = startL;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const candidate = toHex(hslToRgb({ h, s, l }));
        if (contrastRatio(candidate, against) >= minRatio) {
            return candidate;
        }
        const nextL = l + direction * STEP;
        if (nextL <= 0 || nextL >= 1) {
            return toHex(hslToRgb({ h, s, l: Math.max(0, Math.min(1, nextL)) }));
        }
        l = nextL;
    }
    return toHex(hslToRgb({ h, s, l }));
}
