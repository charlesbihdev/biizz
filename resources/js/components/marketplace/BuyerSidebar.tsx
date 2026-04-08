import { Link, router, usePage } from '@inertiajs/react';
import { BookOpen, Settings, Sparkles, LogOut, LayoutDashboard, User, ShieldCheck } from 'lucide-react';
import { index as libraryIndex } from '@/routes/marketplace/library';
import { edit as accountEdit } from '@/routes/marketplace/account';
import { logout, index as marketplaceIndex } from '@/routes/marketplace';
import { creator as becomeCreator } from '@/routes/marketplace/become';
import type { Auth } from '@/types';
import { cn } from '@/lib/utils';

type BuyerStats = {
    purchase_count: number;
    total_spent: string;
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

    return (
        <aside className="flex h-full w-64 shrink-0 flex-col border-r border-site-border bg-site-bg/50 px-5 py-8 backdrop-blur-md">
            {/* Logo area */}
            <div className="mb-10 px-2">
                <Link
                    href={marketplaceIndex().url}
                    className="text-lg font-bold tracking-tight text-site-fg transition hover:opacity-80"
                >
                    biizz<span className="text-brand">.</span>market
                </Link>
            </div>

            {/* Buyer Profile Card */}
            <div className="mb-10 flex items-center gap-3 rounded-2xl border border-site-border bg-white px-3 py-3 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-base font-bold text-brand ring-1 ring-brand/20">
                    {initial}
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-site-fg">{buyer?.name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-site-muted">
                        <ShieldCheck className="h-2.5 w-2.5 text-green-500" />
                        Verified Buyer
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex flex-col gap-1.5">
                <p className="mb-2 px-3 text-[10px] font-bold tracking-widest text-site-muted uppercase">Inventory</p>
                {NAV_ITEMS.map(({ key, label, icon: Icon, href }) => (
                    <Link
                        key={key}
                        href={href()}
                        className={cn(
                            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                            active === key
                                ? 'bg-brand text-white shadow-lg shadow-brand/20'
                                : 'text-site-muted hover:bg-white hover:text-site-fg hover:shadow-sm'
                        )}
                    >
                        <Icon className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-110', active === key ? 'text-white' : 'text-site-muted group-hover:text-brand')} />
                        {label}
                    </Link>
                ))}
            </nav>



            {/* Footer Actions */}
            <div className="mt-auto flex flex-col gap-2 pt-6">
                <button
                    type="button"
                    onClick={() => router.post(becomeCreator().url)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-site-muted transition hover:bg-brand/5 hover:text-brand"
                >
                    <Sparkles className="h-4 w-4" />
                    <span>Become a creator</span>
                </button>
                
                <div className="h-px w-full bg-site-border/50" />

                <button
                    type="button"
                    onClick={() => router.post(logout().url)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-site-muted transition hover:bg-destructive/5 hover:text-destructive"
                >
                    <LogOut className="h-4 w-4 text-destructive/70" />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}
