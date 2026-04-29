import { Library, Clock, TrendingUp } from 'lucide-react';

type Stats = {
    purchase_count: number;
    total_spent: string;
    pending_count: number;
    member_since: string;
    digital_assets: number;
};

export default function AnalyticsRow({ stats }: { stats: Stats }) {
    const formattedSpend = (() => {
        const n = parseFloat(stats.total_spent ?? '0');
        return isNaN(n) ? 'GHS 0.00' : `GHS ${n.toFixed(2)}`;
    })();

    const cards = [
        {
            label: 'Digital Assets',
            value: String(stats.digital_assets),
            sub: 'Ready to access',
            icon: Library,
            accent: false,
        },
        {
            label: 'Total Spent',
            value: formattedSpend,
            sub: `Across ${stats.purchase_count} purchase${stats.purchase_count !== 1 ? 's' : ''}`,
            icon: TrendingUp,
            accent: true,
        },
        {
            label: 'Pending',
            value: String(stats.pending_count),
            sub: 'Awaiting confirmation',
            icon: Clock,
            accent: false,
        },
    ];

    return (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="flex items-center gap-4 rounded-2xl border border-site-border bg-white px-5 py-4 shadow-sm"
                >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.accent ? 'bg-brand/10' : 'bg-zinc-50'}`}>
                        <card.icon className={`h-5 w-5 ${card.accent ? 'text-brand' : 'text-site-muted'}`} />
                    </div>
                    <div className="min-w-0">
                        <p className={`text-lg font-black tracking-tight ${card.accent ? 'text-brand' : 'text-site-fg'}`}>
                            {card.value}
                        </p>
                        <p className="text-[10px] font-bold text-site-muted uppercase">{card.label}</p>
                        <p className="text-[10px] font-medium text-site-muted/70">{card.sub}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
