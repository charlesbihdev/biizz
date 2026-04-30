import { useMemo } from 'react';
import { DEFAULT_PALETTE } from '@/Themes/Shared/palettes';
import { resolveSemanticTokens, type SemanticTokens } from '@/Themes/Shared/Tokens';
import type { Business } from '@/types';

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

function safeHex(value: unknown, fallback: string): string {
    return typeof value === 'string' && HEX_RE.test(value) ? value : fallback;
}

/**
 * Resolve the three brand inputs from a business into the ~10 semantic
 * UI role tokens that components actually consume.
 *
 * Theme components MUST go through this hook -- they must never read
 * `business.theme_settings.primary_color` (or highlight/surface) directly.
 *
 * Memoized on the three hex inputs: same colors -> same object reference,
 * no flicker across renders. Stale or missing keys fall back to the
 * Minimal preset, so existing rows render safely without a data migration.
 */
export function useSemanticTokens(business: Business): SemanticTokens {
    const settings = business.theme_settings ?? {};
    const primary   = safeHex(settings.primary_color,   DEFAULT_PALETTE.primary);
    const highlight = safeHex(settings.highlight_color, DEFAULT_PALETTE.highlight);
    const surface   = safeHex(settings.surface_color,   DEFAULT_PALETTE.surface);

    return useMemo(
        () => resolveSemanticTokens({ primary, highlight, surface }),
        [primary, highlight, surface],
    );
}
