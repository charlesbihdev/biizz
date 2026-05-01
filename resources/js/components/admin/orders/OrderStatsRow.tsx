import { Deferred } from '@inertiajs/react';
import { Ban, CheckCircle2, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { StatTile } from '@/components/common/StatTile';
import type { OrderStats } from '@/types';
import type { OrderFiltersState } from './OrderFilters';

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

function buildScopeHint(filters: OrderFiltersState): string {
    const parts: string[] = [DATE_LABELS[filters.date] ?? 'all time'];
    if (filters.search) parts.push(`"${filters.search}"`);
    return parts.join(' · ');
}

type Props = {
    stats?: OrderStats;
    currency: string;
    filters: OrderFiltersState;
    isDigital: boolean;
};

export function OrderStatsRow({ stats, currency, filters, isDigital }: Props) {
    const scopeHint = buildScopeHint(filters);

    // Deferred prop: skeletons render until Inertia returns the partial reload.
    // All tiles reflect the active search/date filters.
    // Status is intentionally excluded — the four tiles ARE the status breakdown.
    if (isDigital) {
        return (
            <Deferred
                data="stats"
                fallback={
                    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatTile label="Revenue" value={undefined} hint={scopeHint} icon={TrendingUp}   accent="default" />
                        <StatTile label="Paid"    value={undefined} hint={scopeHint} icon={CheckCircle2} accent="success" />
                        <StatTile label="Free"    value={undefined} hint={scopeHint} icon={Sparkles}     accent="default" />
                        <StatTile label="Pending" value={undefined} hint={scopeHint} icon={Clock}        accent="pending" />
                    </div>
                }
            >
                <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatTile
                        label="Revenue"
                        value={stats ? `${currency} ${parseFloat(stats.revenue_total).toFixed(2)}` : undefined}
                        hint={scopeHint}
                        icon={TrendingUp}
                        accent="default"
                    />
                    <StatTile label="Paid"    value={stats?.paid}    hint={scopeHint} icon={CheckCircle2} accent="success" />
                    <StatTile label="Free"    value={stats?.free}    hint={scopeHint} icon={Sparkles}     accent="default" />
                    <StatTile label="Pending" value={stats?.pending} hint={scopeHint} icon={Clock}        accent="pending" />
                </div>
            </Deferred>
        );
    }

    // Physical orders: "Paid" = paid but awaiting fulfillment (action needed).
    // Pending is intentionally not surfaced — orders sit in `pending` only briefly
    // between checkout submission and the payment webhook, so the count is near-always 0.
    return (
        <Deferred
            data="stats"
            fallback={
                <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatTile label="Revenue"   value={undefined} hint={scopeHint} icon={TrendingUp}   accent="default" />
                    <StatTile label="Paid"      value={undefined} hint={scopeHint} icon={Clock}        accent="pending" />
                    <StatTile label="Fulfilled" value={undefined} hint={scopeHint} icon={CheckCircle2} accent="success" />
                    <StatTile label="Cancelled" value={undefined} hint={scopeHint} icon={Ban}          accent="failed"  />
                </div>
            }
        >
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile
                    label="Revenue"
                    value={stats ? `${currency} ${parseFloat(stats.revenue_total).toFixed(2)}` : undefined}
                    hint={scopeHint}
                    icon={TrendingUp}
                    accent="default"
                />
                <StatTile label="Paid"      value={stats?.paid}      hint={scopeHint} icon={Clock}        accent="pending" />
                <StatTile label="Fulfilled" value={stats?.fulfilled} hint={scopeHint} icon={CheckCircle2} accent="success" />
                <StatTile label="Cancelled" value={stats?.cancelled} hint={scopeHint} icon={Ban}          accent="failed"  />
            </div>
        </Deferred>
    );
}
