import { useEffect, useRef, useState } from 'react';
import { Link, router }                from '@inertiajs/react';
import { Search, X }                   from 'lucide-react';
import { DATE_PRESETS }                from './constants';
import type { FilterState }            from './types';

interface AccountFiltersProps {
    sectionUrl: string;
    filters:    FilterState;
    onlyKey:    'orders' | 'payments';
    accent:     string;
    statusTabs: readonly string[];
}

export function AccountFilters({ sectionUrl, filters, onlyKey, accent, statusTabs }: AccountFiltersProps) {
    const [search,     setSearch]     = useState(filters.search);
    const [localDate,  setLocalDate]  = useState(filters.date);
    const [customFrom, setCustomFrom] = useState(filters.date_from);
    const [customTo,   setCustomTo]   = useState(filters.date_to);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setSearch(filters.search); },  [filters.search]);
    useEffect(() => { setLocalDate(filters.date); }, [filters.date]);

    const navigate = (params: Record<string, string>) => {
        router.get(sectionUrl, params, { preserveState: true, preserveScroll: true, only: [onlyKey, 'filters'] });
    };

    const buildParams = (overrides: Record<string, string> = {}): Record<string, string> => {
        const p: Record<string, string> = {};
        if (filters.status !== 'all') p.status = filters.status;
        return { ...p, ...overrides };
    };

    const withDate = (): Record<string, string> => {
        if (filters.date === 'all') return {};
        const p: Record<string, string> = { date: filters.date };
        if (filters.date === 'custom') {
            if (filters.date_from) p.date_from = filters.date_from;
            if (filters.date_to)   p.date_to   = filters.date_to;
        }
        return p;
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            navigate({ ...buildParams(), ...(value ? { search: value } : {}), ...withDate() });
        }, 400);
    };

    const handleDatePreset = (preset: string) => {
        setLocalDate(preset);
        if (preset === 'custom') return;
        navigate({ ...buildParams(), ...(search ? { search } : {}), ...(preset !== 'all' ? { date: preset } : {}) });
    };

    const applyCustomRange = () => {
        navigate({
            ...buildParams(),
            ...(search ? { search } : {}),
            date: 'custom',
            ...(customFrom ? { date_from: customFrom } : {}),
            ...(customTo   ? { date_to:   customTo }   : {}),
        });
    };

    const clearAll = () => {
        setSearch(''); setLocalDate('all'); setCustomFrom(''); setCustomTo('');
        navigate({ ...buildParams() });
    };

    const tabHref = (tab: string) => {
        const p: Record<string, string> = {};
        if (tab !== 'all') p.status = tab;
        if (search) p.search = search;
        if (filters.date !== 'all') {
            p.date = filters.date;
            if (filters.date === 'custom') {
                if (filters.date_from) p.date_from = filters.date_from;
                if (filters.date_to)   p.date_to   = filters.date_to;
            }
        }
        const qs = new URLSearchParams(p).toString();
        return `${sectionUrl}${qs ? `?${qs}` : ''}`;
    };

    const isFiltered = !!search || localDate !== 'all';
    const inputClass = 'rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-zinc-400';

    return (
        <div className="mb-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-48 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search by order ID…"
                        className={`w-full pl-9 pr-3 ${inputClass}`}
                    />
                </div>
                <select value={localDate} onChange={(e) => handleDatePreset(e.target.value)} className={inputClass}>
                    {DATE_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>
                {isFiltered && (
                    <button type="button" onClick={clearAll} className="flex items-center gap-1 text-xs text-zinc-400 transition hover:text-zinc-700">
                        <X className="h-3.5 w-3.5" /> Clear
                    </button>
                )}
            </div>

            {localDate === 'custom' && (
                <div className="flex flex-wrap items-center gap-2">
                    <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className={inputClass} />
                    <span className="text-xs text-zinc-400">to</span>
                    <input type="date" value={customTo}   onChange={(e) => setCustomTo(e.target.value)}   className={inputClass} />
                    <button type="button" onClick={applyCustomRange}
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                        style={{ backgroundColor: accent }}>
                        Apply
                    </button>
                </div>
            )}

            <div className="flex gap-0.5 overflow-x-auto border-b border-zinc-100 pb-0">
                {statusTabs.map((tab) => (
                    <Link
                        key={tab}
                        href={tabHref(tab)}
                        preserveScroll
                        only={[onlyKey, 'filters']}
                        className="shrink-0 px-3 py-2 text-xs font-medium capitalize transition"
                        style={filters.status === tab
                            ? { borderBottom: `2px solid ${accent}`, color: accent, paddingBottom: '6px' }
                            : { color: '#71717a' }}
                    >
                        {tab === 'all' ? 'All' : tab}
                    </Link>
                ))}
            </div>
        </div>
    );
}
