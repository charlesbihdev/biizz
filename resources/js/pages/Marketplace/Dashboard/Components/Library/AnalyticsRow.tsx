import { Library, Wallet, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type Stats = {
    purchase_count: number;
    total_spent: string;
    pending_count: number;
    member_since: string;
    digital_assets: number;
};

export default function AnalyticsRow({ stats }: { stats: Stats }) {
    const cards = [
        {
            label: 'Digital Assets',
            value: stats.digital_assets,
            subtitle: 'Ready to read or download',
            icon: Library,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100',
        },
        {
            label: 'Pending Orders',
            value: stats.pending_count,
            subtitle: 'Awaiting confirmation',
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
        },
    ];

    return (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={cn(
                        'relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md',
                        card.border
                    )}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold tracking-tight text-site-muted uppercase">
                                {card.label}
                            </p>
                            <h3 className="mt-1 text-xl font-black text-site-fg">
                                {card.value}
                            </h3>
                            <p className="mt-0.5 text-[10px] font-medium text-site-muted">
                                {card.subtitle}
                            </p>
                        </div>
                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset', card.bg, card.color, card.border.replace('border-', 'ring-'))}>
                            <card.icon className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
