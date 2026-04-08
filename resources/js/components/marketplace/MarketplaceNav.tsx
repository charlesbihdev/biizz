import { Link, usePage } from '@inertiajs/react';
import { BookOpen, LogIn, Store, UserCircle } from 'lucide-react';
import { index, login as buyerLogin, register as buyerRegister } from '@/routes/marketplace';
import { index as libraryDashboard } from '@/routes/marketplace/library';
import { register } from '@/routes';
import type { Auth } from '@/types';

export default function MarketplaceNav() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const buyer = auth?.buyer;

    return (
        <header className="sticky top-0 z-50 border-b border-site-border bg-site-bg/95 backdrop-blur-sm">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
                <Link
                    href={index().url}
                    className="text-sm font-bold tracking-tight text-site-fg"
                >
                    biizz<span className="text-brand">.</span>market
                </Link>

                <div className="flex items-center gap-2">
                    <Link
                        href={register().url}
                        className="hidden items-center gap-1.5 rounded-full border border-site-border px-3.5 py-1.5 text-xs font-medium text-site-muted transition hover:border-brand hover:text-brand sm:flex"
                    >
                        <Store className="h-3.5 w-3.5" />
                        Sell on biizz
                    </Link>

                    {buyer ? (
                        <Link
                            href={libraryDashboard().url}
                            className="flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-hover"
                        >
                            <BookOpen className="h-3.5 w-3.5" />
                            My Library
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={buyerLogin().url}
                                className="flex items-center gap-1.5 rounded-full border border-site-border px-3.5 py-1.5 text-xs font-medium text-site-muted transition hover:text-site-fg"
                            >
                                <LogIn className="h-3.5 w-3.5" />
                                Sign in
                            </Link>
                            <Link
                                href={buyerRegister().url}
                                className="flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-hover"
                            >
                                <UserCircle className="h-3.5 w-3.5" />
                                Join free
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
