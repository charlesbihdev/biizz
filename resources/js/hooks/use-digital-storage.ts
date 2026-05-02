import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import type { DigitalStorageShared } from '@/types';

/**
 * Read-only access to the digital file storage snapshot shared on every
 * business-scoped page. Drives the pre-upload check in the digital file
 * picker and the usage bar shown to sellers.
 *
 * Returns `null` for routes without a resolved business (auth pages,
 * marketing pages). Components that gate uploads should treat `null` as
 * "no business in scope, do nothing" and let the route guards handle it.
 */
export interface FitCheck {
    ok: boolean;
    /** Why the file would be rejected. `null` when `ok` is true. */
    reason: 'over_per_file' | 'over_quota' | null;
}

export interface UseDigitalStorageReturn {
    snapshot: DigitalStorageShared | null;
    usedBytes: number;
    quotaBytes: number | null;
    perFileMaxBytes: number | null;
    /** Bytes still available; `null` when the tier is unlimited. */
    remainingBytes: number | null;
    /**
     * Whether the file would pass both the per-file cap and the cumulative
     * quota. The frontend uses this to short-circuit the upload before any
     * network call so the seller sees a friendly upgrade modal instead of
     * a backend 402.
     */
    canFit: (file: File) => FitCheck;
}

export function useDigitalStorage(): UseDigitalStorageReturn {
    const { digitalStorage } = usePage().props;

    return useMemo<UseDigitalStorageReturn>(() => {
        const usedBytes = digitalStorage?.used_bytes ?? 0;
        const quotaBytes = digitalStorage?.quota_bytes ?? null;
        const perFileMaxBytes = digitalStorage?.per_file_max_bytes ?? null;
        const remainingBytes = quotaBytes === null ? null : Math.max(0, quotaBytes - usedBytes);

        const canFit = (file: File): FitCheck => {
            if (perFileMaxBytes !== null && file.size > perFileMaxBytes) {
                return { ok: false, reason: 'over_per_file' };
            }

            if (quotaBytes !== null && usedBytes + file.size > quotaBytes) {
                return { ok: false, reason: 'over_quota' };
            }

            return { ok: true, reason: null };
        };

        return {
            snapshot: digitalStorage,
            usedBytes,
            quotaBytes,
            perFileMaxBytes,
            remainingBytes,
            canFit,
        };
    }, [digitalStorage]);
}
