import { Link } from '@inertiajs/react';
import type { PaginatedOrders } from './types';

interface PaginationProps {
    paginated: PaginatedOrders;
    accent:    string;
}

export function Pagination({ paginated, accent }: PaginationProps) {
    if (!paginated.prev_page_url && !paginated.next_page_url) return null;

    return (
        <div className="mt-5 flex items-center justify-between">
            <Link
                href={paginated.prev_page_url ?? '#'}
                className="text-sm font-medium transition"
                style={paginated.prev_page_url ? { color: accent } : { color: '#a1a1aa', pointerEvents: 'none' }}
            >
                ← Previous
            </Link>
            <span className="text-xs text-zinc-400">
                Page {paginated.current_page} of {paginated.last_page} &middot; {paginated.total} total
            </span>
            <Link
                href={paginated.next_page_url ?? '#'}
                className="text-sm font-medium transition"
                style={paginated.next_page_url ? { color: accent } : { color: '#a1a1aa', pointerEvents: 'none' }}
            >
                Next →
            </Link>
        </div>
    );
}
