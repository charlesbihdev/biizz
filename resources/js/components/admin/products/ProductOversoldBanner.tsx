import { AlertTriangle } from 'lucide-react';
import type { ProductStats } from '@/types';

type Props = {
    stats?: ProductStats;
};

export function ProductOversoldBanner({ stats }: Props) {
    if (!stats?.oversold || stats.oversold <= 0) {
        return null;
    }

    return (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div className="text-sm text-red-900">
                <p className="font-semibold">
                    {stats.oversold} {stats.oversold === 1 ? 'product was' : 'products were'} sold below available stock.
                </p>
                <p className="mt-0.5 text-red-800">
                    Review the rows below for items marked oversold and restock or contact the affected buyers.
                </p>
            </div>
        </div>
    );
}
