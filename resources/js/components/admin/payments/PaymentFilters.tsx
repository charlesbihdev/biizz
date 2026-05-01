import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export type PaymentFiltersState = {
    status: string;
    gateway: string;
    search: string;
    date: string;
    date_from: string;
    date_to: string;
};

type Props = {
    indexUrl: string;
    filters: PaymentFiltersState;
    isDigital?: boolean;
};

const DATE_PRESETS = [
    { value: 'all',        label: 'All time' },
    { value: 'today',      label: 'Today' },
    { value: 'yesterday',  label: 'Yesterday' },
    { value: 'this_week',  label: 'This week' },
    { value: 'last_week',  label: 'Last week' },
    { value: 'this_month', label: 'This month' },
    { value: 'last_month', label: 'Last month' },
    { value: 'this_year',  label: 'This year' },
    { value: 'last_year',  label: 'Last year' },
    { value: 'custom',     label: 'Custom range' },
] as const;

const GATEWAYS = [
    { value: 'all',      label: 'All gateways' },
    { value: 'paystack', label: 'Paystack' },
    { value: 'junipay',  label: 'Junipay' },
] as const;

const inputClass =
    'rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30';

export function PaymentFilters({ indexUrl, filters, isDigital = false }: Props) {
    const [search, setSearch]         = useState(filters.search);
    const [localDate, setLocalDate]   = useState(filters.date);
    const [localGateway, setGateway]  = useState(filters.gateway);
    const [customFrom, setCustomFrom] = useState(filters.date_from);
    const [customTo, setCustomTo]     = useState(filters.date_to);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setSearch(filters.search); },     [filters.search]);
    useEffect(() => { setLocalDate(filters.date); },    [filters.date]);
    useEffect(() => { setGateway(filters.gateway); },   [filters.gateway]);

    const reloadProps: string[] = [isDigital ? 'payments' : 'payments', 'filters', 'stats'];

    const navigate = (params: Record<string, string>) => {
        router.get(indexUrl, params, {
            preserveState:  true,
            preserveScroll: true,
            replace:        true,
            only:           reloadProps,
        });
    };

    const withStatus = (): Record<string, string> =>
        filters.status !== 'all' ? { status: filters.status } : {};

    const withGateway = (override?: string): Record<string, string> => {
        const value = override ?? localGateway;
        return value && value !== 'all' ? { gateway: value } : {};
    };

    const withDate = (override?: string): Record<string, string> => {
        const date = override ?? localDate;
        if (date === 'all') { return {}; }
        const p: Record<string, string> = { date };
        if (date === 'custom') {
            if (customFrom) p.date_from = customFrom;
            if (customTo)   p.date_to   = customTo;
        }
        return p;
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            navigate({
                ...withStatus(),
                ...withGateway(),
                ...(value ? { search: value } : {}),
                ...withDate(),
            });
        }, 400);
    };

    const handleDatePreset = (preset: string) => {
        setLocalDate(preset);
        if (preset === 'custom') { return; }
        navigate({
            ...withStatus(),
            ...withGateway(),
            ...(search ? { search } : {}),
            ...(preset !== 'all' ? { date: preset } : {}),
        });
    };

    const handleGateway = (gateway: string) => {
        setGateway(gateway);
        navigate({
            ...withStatus(),
            ...withGateway(gateway),
            ...(search ? { search } : {}),
            ...withDate(),
        });
    };

    const applyCustomRange = () => {
        navigate({
            ...withStatus(),
            ...withGateway(),
            ...(search ? { search } : {}),
            date: 'custom',
            ...(customFrom ? { date_from: customFrom } : {}),
            ...(customTo   ? { date_to:   customTo }   : {}),
        });
    };

    const clearAll = () => {
        setSearch('');
        setLocalDate('all');
        setGateway('all');
        setCustomFrom('');
        setCustomTo('');
        navigate({ ...withStatus() });
    };

    const isFiltered = !!search || localDate !== 'all' || localGateway !== 'all';

    return (
        <div className="mb-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative min-w-56 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-site-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder={
                            isDigital
                                ? 'Search reference, transaction ID or buyer…'
                                : 'Search reference, transaction ID or customer…'
                        }
                        className={`w-full pl-9 pr-3 ${inputClass}`}
                    />
                </div>

                {/* Gateway */}
                <select
                    value={localGateway}
                    onChange={(e) => handleGateway(e.target.value)}
                    className={inputClass}
                >
                    {GATEWAYS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                </select>

                {/* Date preset */}
                <select
                    value={localDate}
                    onChange={(e) => handleDatePreset(e.target.value)}
                    className={inputClass}
                >
                    {DATE_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>

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

            {localDate === 'custom' && (
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className={inputClass}
                    />
                    <span className="text-xs text-site-muted">to</span>
                    <input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        className={inputClass}
                    />
                    <button
                        type="button"
                        onClick={applyCustomRange}
                        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover"
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>
    );
}
