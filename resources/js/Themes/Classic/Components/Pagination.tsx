import { router } from '@inertiajs/react';
import type { PaginatedData } from '@/types/business';

interface Props {
    data: PaginatedData<unknown>;
    accentColor?: string;
}

export default function Pagination({ data, accentColor }: Props) {
    if (data.last_page <= 1) { return null; }

    const accent = accentColor ?? '#1a1a1a';

    const go = (url: string | null) => {
        if (url) { router.visit(url, { preserveScroll: false }); }
    };

    return (
        <div className="flex items-center justify-center gap-4 py-10">
            <button
                type="button"
                disabled={!data.prev_page_url}
                onClick={() => go(data.prev_page_url)}
                className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
                ← Previous
            </button>

            <span className="text-sm text-zinc-500">
                Page {data.current_page} of {data.last_page}
            </span>

            <button
                type="button"
                disabled={!data.next_page_url}
                onClick={() => go(data.next_page_url)}
                className="rounded-full px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: accent }}
            >
                Next →
            </button>
        </div>
    );
}
