import { Deferred } from '@inertiajs/react';
import { AlertTriangle, BadgeDollarSign, Eye, EyeOff, PackageX, Sparkles } from 'lucide-react';
import { StatTile } from '@/components/common/StatTile';
import type { ProductStats } from '@/types';
import type { ProductFiltersState } from './ProductFilters';

function buildScopeHint(filters: ProductFiltersState, categoryName?: string): string {
    const parts: string[] = [];
    if (filters.search) parts.push(`"${filters.search}"`);
    if (categoryName) parts.push(categoryName);
    return parts.length > 0 ? parts.join(' · ') : 'all products';
}

type Props = {
    stats?: ProductStats;
    filters: ProductFiltersState;
    isDigital: boolean;
    categoryName?: string;
};

export function ProductStatsRow({ stats, filters, isDigital, categoryName }: Props) {
    const scopeHint = buildScopeHint(filters, categoryName);

    // Deferred prop: skeletons render until Inertia returns the partial reload.
    // Tiles reflect the active search/category filters.
    // Status is intentionally excluded — Active/Hidden ARE the status breakdown.
    if (isDigital) {
        return (
            <Deferred
                data="stats"
                fallback={
                    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatTile label="Active" value={undefined} hint={scopeHint} icon={Eye}             accent="success" />
                        <StatTile label="Hidden" value={undefined} hint={scopeHint} icon={EyeOff}          accent="default" />
                        <StatTile label="Free"   value={undefined} hint={scopeHint} icon={Sparkles}        accent="default" />
                        <StatTile label="Paid"   value={undefined} hint={scopeHint} icon={BadgeDollarSign} accent="success" />
                    </div>
                }
            >
                <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatTile label="Active" value={stats?.active} hint={scopeHint} icon={Eye}             accent="success" />
                    <StatTile label="Hidden" value={stats?.hidden} hint={scopeHint} icon={EyeOff}          accent="default" />
                    <StatTile label="Free"   value={stats?.free}   hint={scopeHint} icon={Sparkles}        accent="default" />
                    <StatTile label="Paid"   value={stats?.paid}   hint={scopeHint} icon={BadgeDollarSign} accent="success" />
                </div>
            </Deferred>
        );
    }

    return (
        <Deferred
            data="stats"
            fallback={
                <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatTile label="Active"       value={undefined} hint={scopeHint} icon={Eye}            accent="success" />
                    <StatTile label="Hidden"       value={undefined} hint={scopeHint} icon={EyeOff}         accent="default" />
                    <StatTile label="Out of stock" value={undefined} hint={scopeHint} icon={PackageX}       accent="failed"  />
                    <StatTile label="Low stock"    value={undefined} hint={scopeHint} icon={AlertTriangle}  accent="pending" />
                </div>
            }
        >
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile label="Active"       value={stats?.active}       hint={scopeHint} icon={Eye}           accent="success" />
                <StatTile label="Hidden"       value={stats?.hidden}       hint={scopeHint} icon={EyeOff}        accent="default" />
                <StatTile label="Out of stock" value={stats?.out_of_stock} hint={scopeHint} icon={PackageX}      accent="failed"  />
                <StatTile label="Low stock"    value={stats?.low_stock}    hint={scopeHint} icon={AlertTriangle} accent="pending" />
            </div>
        </Deferred>
    );
}
