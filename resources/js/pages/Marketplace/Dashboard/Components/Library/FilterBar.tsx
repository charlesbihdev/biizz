import { router } from '@inertiajs/react';
import { Search, Filter, X, ChevronDown, Check } from 'lucide-react';
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
        // Clean out undefined or empty string values
        const cleanParams: Record<string, string> = {};
        Object.entries(params).forEach(([k, v]) => {
            if (v) cleanParams[k] = v;
        });

        router.get(
            window.location.pathname,
            cleanParams,
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
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
        
        if (value) {
            p[key] = value;
        } else {
            delete p[key];
        }
        
        navigate(p);
    };

    const clearFilters = () => {
        setSearch('');
        navigate({});
    };

    const activeStatus = STATUS_OPTIONS.find(o => o.value === (filters.status ?? ''))?.label;
    const activeCategory = CATEGORY_OPTIONS.find(o => o.value === (filters.category ?? ''))?.label;

    return (
        <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            {/* Search Bar */}
            <div className="relative w-full max-w-sm">
                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-site-muted" />
                <input
                    type="text"
                    placeholder="Search by title or author..."
                    value={search}
                    onChange={handleSearchChange}
                    className="h-11 w-full rounded-2xl border border-site-border bg-white pl-10 pr-4 text-sm font-medium text-site-fg shadow-sm outline-hidden ring-brand/20 transition-all focus:border-brand focus:ring-1"
                />
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
                {/* Status Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-11 items-center gap-2 rounded-2xl border border-site-border bg-white px-4 text-xs font-bold text-site-fg shadow-sm hover:bg-zinc-50">
                        <Filter className="h-3.5 w-3.5 text-site-muted" />
                        <span>{activeStatus}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-site-muted" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-2xl border-site-border shadow-xl">
                        <DropdownMenuLabel className="text-[10px] font-bold text-site-muted uppercase">Filter by status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {STATUS_OPTIONS.map((opt) => (
                            <DropdownMenuItem
                                key={opt.value}
                                onClick={() => applyFilter('status', opt.value || undefined)}
                                className="flex items-center justify-between px-3 py-2 text-xs font-medium"
                            >
                                {opt.label}
                                {filters.status === opt.value && <Check className="h-3.5 w-3.5 text-brand" />}
                                {(filters.status === undefined && opt.value === '') && <Check className="h-3.5 w-3.5 text-brand" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Category Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-11 items-center gap-2 rounded-2xl border border-site-border bg-white px-4 text-xs font-bold text-site-fg shadow-sm hover:bg-zinc-50">
                        <LayoutGrid className="h-3.5 w-3.5 text-site-muted" />
                        <span>{activeCategory}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-site-muted" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-2xl border-site-border shadow-xl">
                        <DropdownMenuLabel className="text-[10px] font-bold text-site-muted uppercase">Digital category</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {CATEGORY_OPTIONS.map((opt) => (
                            <DropdownMenuItem
                                key={opt.value}
                                onClick={() => applyFilter('category', opt.value || undefined)}
                                className="flex items-center justify-between px-3 py-2 text-xs font-medium"
                            >
                                {opt.label}
                                {filters.category === opt.value && <Check className="h-3.5 w-3.5 text-brand" />}
                                {(filters.category === undefined && opt.value === '') && <Check className="h-3.5 w-3.5 text-brand" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {(filters.search || filters.status || filters.category) && (
                    <button
                        onClick={clearFilters}
                        className="flex h-11 items-center justify-center rounded-2xl bg-[#f0f0f0] px-3 text-site-muted transition-colors hover:bg-[#e0e0e0] hover:text-site-fg"
                        title="Clear filters"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

// Minimal icons for DropdownMenu
function LayoutGrid(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
    )
}
