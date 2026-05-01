import { Link } from '@inertiajs/react';
import type { PaymentStatus } from '@/types';
import type { PaymentFiltersState } from './PaymentFilters';

const TABS: ReadonlyArray<'all' | PaymentStatus> = ['all', 'pending', 'success', 'failed'];

type Props = {
    indexUrl: string;
    filters: PaymentFiltersState;
};

export function PaymentTabs({ indexUrl, filters }: Props) {
    const tabHref = (tab: 'all' | PaymentStatus) => {
        const params: Record<string, string> = {};
        if (tab !== 'all')                                  params.status   = tab;
        if (filters.gateway && filters.gateway !== 'all')   params.gateway  = filters.gateway;
        if (filters.search)                                 params.search   = filters.search;
        if (filters.date && filters.date !== 'all')         params.date     = filters.date;
        if (filters.date === 'custom' && filters.date_from) params.date_from = filters.date_from;
        if (filters.date === 'custom' && filters.date_to)   params.date_to   = filters.date_to;
        const qs = new URLSearchParams(params).toString();
        return `${indexUrl}${qs ? `?${qs}` : ''}`;
    };

    return (
        <div className="mb-4 flex gap-1 overflow-x-auto border-b border-site-border pb-0">
            {TABS.map((tab) => (
                <Link
                    key={tab}
                    href={tabHref(tab)}
                    preserveScroll
                    only={['payments', 'filters', 'stats']}
                    className={`shrink-0 rounded-t px-4 py-2 text-sm font-medium capitalize transition ${
                        filters.status === tab
                            ? 'border-b-2 border-brand text-brand'
                            : 'text-site-muted hover:text-site-fg'
                    }`}
                >
                    {tab}
                </Link>
            ))}
        </div>
    );
}
