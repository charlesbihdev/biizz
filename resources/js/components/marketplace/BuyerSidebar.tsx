import { Link, router, usePage } from '@inertiajs/react';
import { BookOpen, Settings, Sparkles, LogOut, ShieldCheck } from 'lucide-react';
import { index as libraryIndex } from '@/routes/marketplace/library';
import { edit as accountEdit } from '@/routes/marketplace/account';
import { logout, index as marketplaceIndex } from '@/routes/marketplace';
import { creator as becomeCreator } from '@/routes/marketplace/become';
import type { Auth } from '@/types';
import { cn } from '@/lib/utils';

type BuyerStats = {
    purchase_count: number;
    total_spent: string;
    member_since: string;
    digital_assets: number;
};

type Props = {
    active: 'library' | 'account';
    stats: BuyerStats;
};

const NAV_ITEMS = [
    { key: 'library', label: 'My Library', icon: BookOpen, href: () => libraryIndex().url },
    { key: 'account', label: 'Account Settings', icon: Settings, href: () => accountEdit().url },
] as const;

export default function BuyerSidebar({ active, stats }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const buyer = auth?.buyer;
    const initial = buyer?.name?.[0]?.toUpperCase() ?? '?';

    const formattedSpend = (() => {
        const n = parseFloat(stats.total_spent ?? '0');
        return isNaN(n) ? 'GHS 0.00' : `GHS ${n.toFixed(2)}`;
    })();

    return (
        <aside className="flex h-full w-64 shrink-0 flex-col bg-site-ink px-5 py-8">
            {/* Logo */}
            <div className="mb-10 px-2">
                <Link
                    href={marketplaceIndex().url}
                    className="text-lg font-bold tracking-tight text-white transition hover:opacity-75"
                >
                    biizz<span className="text-brand">.</span>market
                </Link>
            </div>

            {/* Profile card */}
            <div className="mb-8 flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3 ring-1 ring-white/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-black text-white shadow-lg shadow-brand/30">
                    {initial}
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{buyer?.name ?? 'Buyer'}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/40">
                        <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
                        Verified Buyer
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1">
                <p className="mb-2 px-3 text-[10px] font-bold tracking-widest text-white/25 uppercase">
                    Navigation
                </p>
                {NAV_ITEMS.map(({ key, label, icon: Icon, href }) => (
                    <Link
                        key={key}
                        href={href()}
                        className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                            active === key
                                ? 'bg-brand text-white shadow-lg shadow-brand/25'
                                : 'text-white/45 hover:bg-white/6 hover:text-white/80'
                        )}
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                    </Link>
                ))}
            </nav>

            {/* Activity panel */}
            <div className="mt-8 rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                <p className="mb-4 text-[10px] font-bold tracking-widest text-white/25 uppercase">
                    My Activity
                </p>
                <div className="space-y-4">
                    <div>
                        <p className="text-2xl font-black tracking-tight text-white">{formattedSpend}</p>
                        <p className="mt-0.5 text-[10px] font-medium text-white/35">Total Spent</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-white/5 px-3 py-2.5">
                            <p className="text-base font-black text-white">{stats.digital_assets}</p>
                            <p className="text-[10px] font-medium text-white/35">Assets</p>
                        </div>
                        <div className="rounded-xl bg-white/5 px-3 py-2.5">
                            <p className="text-[10px] font-medium text-white/35">Since</p>
                            <p className="text-[10px] font-bold text-white/60 leading-5">{stats.member_since}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto flex flex-col gap-1 pt-6">
                <button
                    type="button"
                    onClick={() => router.post(becomeCreator().url)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 transition hover:bg-brand/10 hover:text-brand"
                >
                    <Sparkles className="h-4 w-4" />
                    Become a creator
                </button>

                <div className="my-1 h-px w-full bg-white/8" />

                <button
                    type="button"
                    onClick={() => router.post(logout().url)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut className="h-4 w-4" />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
