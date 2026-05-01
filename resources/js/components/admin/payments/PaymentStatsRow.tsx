import { Deferred } from '@inertiajs/react';
import { CheckCircle2, Clock, TrendingUp, XCircle } from 'lucide-react';
import { StatTile } from '@/components/common/StatTile';
import type { PaymentStats } from '@/types';
import type { PaymentFiltersState } from './PaymentFilters';

const DATE_LABELS: Record<string, string> = {
    all:        'all time',
    today:      'today',
    yesterday:  'yesterday',
    this_week:  'this week',
    last_week:  'last week',
    this_month: 'this month',
    last_month: 'last month',
    this_year:  'this year',
    last_year:  'last year',
    custom:     'custom range',
};

function buildScopeHint(filters: PaymentFiltersState): string {
    const parts: string[] = [DATE_LABELS[filters.date] ?? 'all time'];
    if (filters.gateway && filters.gateway !== 'all') parts.push(filters.gateway);
    if (filters.search) parts.push(`"${filters.search}"`);
    return parts.join(' · ');
}

type Props = {
    stats?: PaymentStats;
    currency: string;
    filters: PaymentFiltersState;
};

export function PaymentStatsRow({ stats, currency, filters }: Props) {
    const scopeHint = buildScopeHint(filters);

    // Deferred prop: skeletons render until Inertia returns the partial reload.
    // All tiles reflect the active gateway/date/search filters.
    // Status is intentionally excluded — the four tiles ARE the status breakdown.
    return (
        <Deferred
            data="stats"
            fallback={
                <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatTile label="Received"   value={undefined} hint={scopeHint} icon={TrendingUp}   accent="default" />
                    <StatTile label="Successful" value={undefined} hint={scopeHint} icon={CheckCircle2} accent="success" />
                    <StatTile label="Pending"    value={undefined} hint={scopeHint} icon={Clock}        accent="pending" />
                    <StatTile label="Failed"     value={undefined} hint={scopeHint} icon={XCircle}      accent="failed"  />
                </div>
            }
        >
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile
                    label="Received"
                    value={stats ? `${currency} ${parseFloat(stats.received_total).toFixed(2)}` : undefined}
                    hint={scopeHint}
                    icon={TrendingUp}
                    accent="default"
                />
                <StatTile label="Successful" value={stats?.success} hint={scopeHint} icon={CheckCircle2} accent="success" />
                <StatTile label="Pending"    value={stats?.pending} hint={scopeHint} icon={Clock}        accent="pending" />
                <StatTile label="Failed"     value={stats?.failed}  hint={scopeHint} icon={XCircle}      accent="failed"  />
            </div>
        </Deferred>
    );
}
