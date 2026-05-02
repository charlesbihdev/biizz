import { Deferred } from '@inertiajs/react';
import { Repeat, UserCheck, UserX, Users } from 'lucide-react';
import { StatTile } from '@/components/common/StatTile';
import type { CustomerStats } from '@/types';
import type { CustomerFiltersState } from './CustomerFilters';

function buildScopeHint(filters: CustomerFiltersState): string {
    const parts: string[] = [];
    if (filters.status !== 'all') parts.push(filters.status);
    if (filters.search) parts.push(`"${filters.search}"`);
    return parts.length > 0 ? parts.join(' · ') : 'all customers';
}

type Props = {
    stats?: CustomerStats;
    filters: CustomerFiltersState;
};

export function CustomerStatsRow({ stats, filters }: Props) {
    const scopeHint = buildScopeHint(filters);

    return (
        <Deferred
            data="stats"
            fallback={
                <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatTile label="Total"         value={undefined} hint={scopeHint} icon={Users}     accent="default" />
                    <StatTile label="Active"        value={undefined} hint={scopeHint} icon={UserCheck} accent="success" />
                    <StatTile label="Blocked"       value={undefined} hint={scopeHint} icon={UserX}     accent="failed" />
                    <StatTile label="Repeat buyers" value={undefined} hint={scopeHint} icon={Repeat}    accent="pending" />
                </div>
            }
        >
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile label="Total"         value={stats?.total}         hint={scopeHint} icon={Users}     accent="default" />
                <StatTile label="Active"        value={stats?.active}        hint={scopeHint} icon={UserCheck} accent="success" />
                <StatTile label="Blocked"       value={stats?.blocked}       hint={scopeHint} icon={UserX}     accent="failed" />
                <StatTile label="Repeat buyers" value={stats?.repeat_buyers} hint={scopeHint} icon={Repeat}    accent="pending" />
            </div>
        </Deferred>
    );
}
