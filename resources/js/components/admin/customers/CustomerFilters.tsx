import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export type CustomerFiltersState = {
    search: string;
    status: string;
};

type Props = {
    indexUrl: string;
    filters: CustomerFiltersState;
};

const inputClass =
    'rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30';

export function CustomerFilters({ indexUrl, filters }: Props) {
    const [search, setSearch]       = useState(filters.search);
    const [status, setStatus]       = useState(filters.status);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setSearch(filters.search); }, [filters.search]);
    useEffect(() => { setStatus(filters.status); }, [filters.status]);

    const navigate = (params: Record<string, string>) => {
        router.get(indexUrl, params, {
            preserveState: true,
            preserveScroll: true,
            only: ['customers', 'filters', 'stats'],
        });
    };

    const withStatus = (): Record<string, string> =>
        status !== 'all' ? { status } : {};

    const handleSearch = (value: string) => {
        setSearch(value);
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            navigate({ ...withStatus(), ...(value ? { search: value } : {}) });
        }, 400);
    };

    const handleStatus = (value: string) => {
        setStatus(value);
        navigate({ ...(value !== 'all' ? { status: value } : {}), ...(search ? { search } : {}) });
    };

    const clearAll = () => {
        setSearch('');
        setStatus('all');
        navigate({});
    };

    const isFiltered = !!search || status !== 'all';

    return (
        <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative min-w-56 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-site-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search name, email or phone…"
                        className={`w-full pl-9 pr-3 ${inputClass}`}
                    />
                </div>

                {/* Status filter */}
                <select
                    value={status}
                    onChange={(e) => handleStatus(e.target.value)}
                    className={inputClass}
                >
                    <option value="all">All customers</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                </select>

                {isFiltered && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="flex items-center gap-1 text-xs text-site-muted transition hover:text-site-fg"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
