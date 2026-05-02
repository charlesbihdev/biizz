import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export type ProductFiltersState = {
    search: string;
    status: string;
    category: string;
};

type Category = { id: number; name: string };

type Props = {
    indexUrl: string;
    filters: ProductFiltersState;
    categories: Category[];
};

const inputClass =
    'rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30';

export function ProductFilters({ indexUrl, filters, categories }: Props) {
    const [search, setSearch] = useState(filters.search);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setSearch(filters.search); }, [filters.search]);

    const navigate = (params: Record<string, string>) => {
        router.get(indexUrl, params, {
            preserveState: true,
            preserveScroll: true,
            only: ['products', 'filters', 'stats'],
        });
    };

    const buildBase = (): Record<string, string> => {
        const p: Record<string, string> = {};
        if (filters.status !== 'all') p.status = filters.status;
        if (filters.category) p.category = filters.category;
        return p;
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            navigate({ ...buildBase(), ...(value ? { search: value } : {}) });
        }, 400);
    };

    const handleStatus = (value: string) => {
        navigate({
            ...(search ? { search } : {}),
            ...(filters.category ? { category: filters.category } : {}),
            ...(value !== 'all' ? { status: value } : {}),
        });
    };

    const handleCategory = (value: string) => {
        navigate({
            ...(search ? { search } : {}),
            ...(filters.status !== 'all' ? { status: filters.status } : {}),
            ...(value ? { category: value } : {}),
        });
    };

    const clearAll = () => {
        setSearch('');
        navigate({});
    };

    const isFiltered = !!search || filters.status !== 'all' || !!filters.category;

    return (
        <div className="mb-4 flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-56 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-site-muted" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search products…"
                    className={`w-full pl-9 pr-3 ${inputClass}`}
                />
            </div>

            {/* Status */}
            <select value={filters.status} onChange={(e) => handleStatus(e.target.value)} className={inputClass}>
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
            </select>

            {/* Category */}
            {categories.length > 0 && (
                <select value={filters.category} onChange={(e) => handleCategory(e.target.value)} className={inputClass}>
                    <option value="">All categories</option>
                    {categories.map((c) => (
                        <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                </select>
            )}

            {/* Clear */}
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
    );
}
