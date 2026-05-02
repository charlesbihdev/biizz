import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Human-readable byte size. Picks the largest unit that keeps the number
 * above 1 (so 50_000_000 -> "50 MB", not "0.05 GB"). Two decimals when the
 * value is below 10 in the chosen unit, otherwise zero.
 */
export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;

    const units = ['KB', 'MB', 'GB', 'TB'];
    let value = bytes / 1024;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }

    const decimals = value < 10 ? 1 : 0;
    return `${value.toFixed(decimals)} ${units[unitIndex]}`;
}

/**
 * Currency-aware price formatter used across billing, pricing, and the
 * upgrade modal. `0` always renders as "Free" so we don't display "GHS 0"
 * on the Free tier.
 */
export function formatPrice(amount: number | string, currency: string): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!Number.isFinite(value) || value === 0) return 'Free';
    return `${currency} ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

/**
 * Locale-friendly short date used by the billing surfaces (e.g. "Jun 1, 2026").
 * Returns an em-dash-free placeholder for null inputs so callers can pass
 * optional ISO strings directly.
 */
export function formatShortDate(iso: string | null | undefined): string {
    if (!iso) return 'Not set';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Not set';
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
