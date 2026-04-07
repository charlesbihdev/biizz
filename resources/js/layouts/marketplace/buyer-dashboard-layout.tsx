import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Settings } from 'lucide-react';
import { type ReactNode } from 'react';
import BuyerSidebar from '@/components/marketplace/BuyerSidebar';
import MarketplaceNav from '@/components/marketplace/MarketplaceNav';
import ToastProvider from '@/components/toast-provider';
import { index as libraryIndex } from '@/routes/marketplace/library';
import { edit as accountEdit } from '@/routes/marketplace/account';

type BuyerStats = { purchase_count: number; total_spent: string };

type Props = {
    children: ReactNode;
    active: 'library' | 'account';
    stats: BuyerStats;
};

const MOBILE_TABS = [
    { key: 'library', label: 'Library', icon: BookOpen, href: () => libraryIndex().url },
    { key: 'account', label: 'Account', icon: Settings, href: () => accountEdit().url },
] as const;

export default function BuyerDashboardLayout({ children, active, stats }: Props) {
    return (
        <ToastProvider>
            <div className="min-h-screen bg-site-bg">
                {/* Mobile: top nav */}
                <div className="lg:hidden">
                    <MarketplaceNav />
                    <div className="flex border-b border-site-border bg-site-bg px-5">
                        {MOBILE_TABS.map(({ key, label, icon: Icon, href }) => (
                            <Link
                                key={key}
                                href={href()}
                                className={[
                                    'flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition',
                                    active === key
                                        ? 'border-brand text-brand'
                                        : 'border-transparent text-site-muted hover:text-site-fg',
                                ].join(' ')}
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

                    <main className="flex-1 overflow-y-auto px-5 py-8 lg:px-10 lg:py-10">
                        {children}
                    </main>
                </div>
            </div>
        </ToastProvider>
    );
}
