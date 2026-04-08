import { Link, router, usePage } from '@inertiajs/react';
import { BookOpen, Settings, Sparkles, LogOut } from 'lucide-react';
import { index as libraryIndex } from '@/routes/marketplace/library';
import { edit as accountEdit } from '@/routes/marketplace/account';
import { logout, index as marketplaceIndex } from '@/routes/marketplace';
import { creator as becomeCreator } from '@/routes/marketplace/become';
import type { Auth } from '@/types';

type BuyerStats = {
    purchase_count: number;
    total_spent: string;
};

type Props = {
    active: 'library' | 'account';
    stats: BuyerStats;
};

const NAV = [
    { key: 'library',  label: 'My Library', icon: BookOpen,  href: () => libraryIndex().url },
    { key: 'account',  label: 'Account',    icon: Settings,  href: () => accountEdit().url },
] as const;

export default function BuyerSidebar({ active, stats }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const buyer = auth?.buyer;
    const initial = buyer?.name?.[0]?.toUpperCase() ?? '?';

    return (
        <aside className="flex h-full w-60 shrink-0 flex-col border-r border-site-border bg-site-bg px-4 py-6">
            {/* Buyer identity */}
            <div className="mb-6 flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {initial}
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-site-fg">{buyer?.name}</p>
                    <p className="truncate text-xs text-site-muted">{buyer?.email}</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-0.5">
                {NAV.map(({ key, label, icon: Icon, href }) => (
                    <Link
                        key={key}
                        href={href()}
                        className={[
                            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                            active === key
                                ? 'border-l-2 border-brand bg-brand/5 text-brand'
                                : 'text-site-muted hover:bg-site-surface hover:text-site-fg',
                        ].join(' ')}
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                    </Link>
                ))}
            </nav>

            {/* Stats */}
            <div className="mt-6 rounded-xl border border-site-border bg-site-surface px-3 py-3">
                <p className="text-xs font-semibold text-site-fg">{stats.purchase_count} product{stats.purchase_count !== 1 ? 's' : ''}</p>
                <p className="mt-0.5 text-xs text-site-muted">
                    GHS {parseFloat(stats.total_spent || '0').toFixed(2)} spent
                </p>
            </div>

            {/* Bottom actions */}
            <div className="mt-auto flex flex-col gap-1">
                <button
                    type="button"
                    onClick={() => router.post(becomeCreator().url)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-site-muted transition hover:bg-site-surface hover:text-brand"
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    Become a creator
                </button>
                <button
                    type="button"
                    onClick={() => router.post(logout().url)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-site-muted transition hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
