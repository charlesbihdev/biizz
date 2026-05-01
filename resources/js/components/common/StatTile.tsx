import type { LucideIcon } from 'lucide-react';

type Props = {
    label: string;
    value: string | number | undefined;
    hint?: string;
    icon?: LucideIcon;
    accent?: 'default' | 'success' | 'pending' | 'failed';
};

const ACCENT_RING: Record<NonNullable<Props['accent']>, string> = {
    default: 'bg-site-surface text-site-muted',
    success: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    failed:  'bg-red-50 text-red-700',
};

export function StatTile({ label, value, hint, icon: Icon, accent = 'default' }: Props) {
    const isLoading = value === undefined;

    return (
        <div className="rounded-xl border border-site-border bg-white p-5">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-site-muted">
                        {label}
                    </p>
                    {isLoading ? (
                        <div className="h-7 w-24 animate-pulse rounded bg-site-surface" />
                    ) : (
                        <p className="text-2xl font-bold tabular-nums text-site-fg">
                            {value}
                        </p>
                    )}
                    {hint && !isLoading && (
                        <p className="text-xs text-site-muted">{hint}</p>
                    )}
                </div>
                {Icon && (
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${ACCENT_RING[accent]}`}>
                        <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                    </div>
                )}
            </div>
        </div>
    );
}
