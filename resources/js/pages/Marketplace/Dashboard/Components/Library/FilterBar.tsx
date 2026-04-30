import { router } from '@inertiajs/react';
import { Search, Filter, X, ChevronDown, Check, LayoutGrid } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { DIGITAL_CATEGORIES } from '@/data/digital-categories';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
    filters: {
        search?: string;
        status?: string;
        category?: string;
    };
}

const STATUS_OPTIONS = [
    { label: 'All Inventory', value: '' },
    { label: 'Paid', value: 'paid' },
    { label: 'Free', value: 'free' },
    { label: 'Pending', value: 'pending' },
];

const formatCategory = (cat: string) => {
    if (cat === 'ebooks') return 'E-Books';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
};

const CATEGORY_OPTIONS = [
    { label: 'All Types', value: '' },
    ...DIGITAL_CATEGORIES.map((cat) => ({
        label: formatCategory(cat),
        value: cat,
    })),
];

export default function FilterBar({ filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setSearch(filters.search ?? ''); }, [filters.search]);

    const navigate = (params: Record<string, string>) => {
        const cleanParams: Record<string, string> = {};
        Object.entries(params).forEach(([k, v]) => {
            if (v) cleanParams[k] = v;
        });
        router.get(window.location.pathname, cleanParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const buildBase = (): Record<string, string> => {
        const p: Record<string, string> = {};
        if (filters.status) p.status = filters.status;
        if (filters.category) p.category = filters.category;
        return p;
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            navigate({ ...buildBase(), ...(value ? { search: value } : {}) });
        }, 400);
    };

    const applyFilter = (key: 'status' | 'category', value?: string) => {
        const p = buildBase();
        if (search) p.search = search;
        if (value) { p[key] = value; } else { delete p[key]; }
        navigate(p);
    };

    const clearFilters = () => {
        setSearch('');
        navigate({});
    };

    const activeStatus = STATUS_OPTIONS.find(o => o.value === (filters.status ?? ''))?.label;
    const activeCategory = CATEGORY_OPTIONS.find(o => o.value === (filters.category ?? ''))?.label;
    const hasActiveFilters = filters.search || filters.status || filters.category;

    const triggerClass =
        'flex h-10 items-center gap-2 rounded-xl border border-site-border bg-white px-3.5 text-xs font-bold text-site-fg shadow-sm transition hover:bg-zinc-50 whitespace-nowrap';

    return (
        <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative w-full max-w-sm">
                <Search className="absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-site-muted" />
                <input
                    type="text"
                    placeholder="Search by title or creator..."
                    value={search}
                    onChange={handleSearchChange}
                    className="h-10 w-full rounded-xl border border-site-border bg-white pl-10 pr-4 text-sm font-medium text-site-fg shadow-sm outline-hidden ring-brand/20 transition focus:border-brand focus:ring-1"
                />
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
                {/* Status Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger className={triggerClass}>
                        <Filter className="h-3.5 w-3.5 text-site-muted" />
                        <span>{activeStatus}</span>
                        <ChevronDown className="h-3 w-3 text-site-muted" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 rounded-xl border-site-border shadow-xl">
                        <DropdownMenuLabel className="text-[10px] font-bold text-site-muted uppercase">Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {STATUS_OPTIONS.map((opt) => (
                            <DropdownMenuItem
                                key={opt.value}
                                onClick={() => applyFilter('status', opt.value || undefined)}
                                className="flex items-center justify-between px-3 py-2 text-xs font-medium"
                            >
                                {opt.label}
                                {(filters.status === opt.value || (!filters.status && opt.value === '')) && (
                                    <Check className="h-3.5 w-3.5 text-brand" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Category Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger className={triggerClass}>
                        <LayoutGrid className="h-3.5 w-3.5 text-site-muted" />
                        <span>{activeCategory}</span>
                        <ChevronDown className="h-3 w-3 text-site-muted" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 rounded-xl border-site-border shadow-xl">
                        <DropdownMenuLabel className="text-[10px] font-bold text-site-muted uppercase">Category</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {CATEGORY_OPTIONS.map((opt) => (
                            <DropdownMenuItem
                                key={opt.value}
                                onClick={() => applyFilter('category', opt.value || undefined)}
                                className="flex items-center justify-between px-3 py-2 text-xs font-medium"
                            >
                                {opt.label}
                                {(filters.category === opt.value || (!filters.category && opt.value === '')) && (
                                    <Check className="h-3.5 w-3.5 text-brand" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-site-border bg-white text-site-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        title="Clear filters"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
