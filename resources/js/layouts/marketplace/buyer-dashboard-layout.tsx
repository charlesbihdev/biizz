import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Settings, LayoutGrid, User } from 'lucide-react';
import { type ReactNode } from 'react';
import BuyerSidebar from '@/components/marketplace/BuyerSidebar';
import MarketplaceNav from '@/components/marketplace/MarketplaceNav';
import ToastProvider from '@/components/toast-provider';
import { index as libraryIndex } from '@/routes/marketplace/library';
import { edit as accountEdit } from '@/routes/marketplace/account';
import { cn } from '@/lib/utils';

type BuyerStats = { purchase_count: number; total_spent: string };

type Props = {
    children: ReactNode;
    active: 'library' | 'account';
    stats: BuyerStats;
};

const MOBILE_TABS = [
    { key: 'library', label: 'Library', icon: LayoutGrid, href: () => libraryIndex().url },
    { key: 'account', label: 'Account', icon: User, href: () => accountEdit().url },
] as const;

export default function BuyerDashboardLayout({ children, active, stats }: Props) {
    return (
        <ToastProvider>
            <div className="min-h-screen bg-site-bg font-sans selection:bg-brand/10 selection:text-brand">
                {/* Mobile: top nav */}
                <div className="sticky top-0 z-40 lg:hidden">
                    <MarketplaceNav />
                    <div className="flex border-b border-site-border bg-white/80 px-5 backdrop-blur-md">
                        {MOBILE_TABS.map(({ key, label, icon: Icon, href }) => (
                            <Link
                                key={key}
                                href={href()}
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-2 border-b-2 py-4 text-xs font-bold transition-all',
                                    active === key
                                        ? 'border-brand text-brand'
                                        : 'border-transparent text-site-muted hover:text-site-fg'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Desktop: sidebar + content */}
                <div className="flex lg:h-screen">
                    <div className="hidden lg:flex lg:flex-col">
                        <BuyerSidebar active={active} stats={stats} />
                    </div>

                    <main className="relative flex-1 overflow-y-auto bg-[#fafafa] px-6 py-8 lg:px-12 lg:py-12">
                        {/* Subtle background glow */}
                        <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden opacity-20">
                            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand/20 blur-[120px]" />
                        </div>
                        
                        <div className="relative mx-auto max-w-6xl">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </ToastProvider>
    );
}
