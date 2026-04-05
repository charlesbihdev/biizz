import { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { LogOut, ShoppingBag } from 'lucide-react';
import { show, checkout } from '@/routes/storefront';
import { destroy as logoutRoute } from '@/actions/App/Http/Controllers/StorefrontAuth/LogoutController';
import { useCartStore } from '@/stores/cartStore';
import type { AuthenticatedCustomer, Business, CustomerLoginMode, Page } from '@/types/business';

interface Props {
    business:        Business;
    pages:           Page[];
    accent:          string;
    loginMode:       CustomerLoginMode;
    isAuthenticated: boolean;
    customer:        AuthenticatedCustomer | null;
    catalogMode?:    boolean;
    onAuthClick:     () => void;
}

function AccountMenu({
    customer,
    accent,
    businessSlug,
}: {
    customer:     AuthenticatedCustomer;
    accent:       string;
    businessSlug: string;
}) {
    const [open, setOpen] = useState(false);
    const ref             = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) { return; }
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const initial = (customer.name?.[0] ?? '?').toUpperCase();

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white transition hover:opacity-85"
                style={{ backgroundColor: accent }}
                aria-label="Account menu"
            >
                {customer.avatar ? (
                    <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="h-full w-full rounded-full object-cover"
                    />
                ) : (
                    initial
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-zinc-100 bg-white py-1 shadow-lg">
                    <div className="border-b border-zinc-100 px-4 py-2.5">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                            {customer.name}
                        </p>
                        {customer.email && (
                            <p className="truncate text-xs text-zinc-400">
                                {customer.email}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            router.post(logoutRoute.url(businessSlug));
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-zinc-600 transition hover:bg-zinc-50"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
}

export default function FunnelNav({
    business,
    accent,
    loginMode,
    isAuthenticated,
    customer,
    catalogMode = true,
    onAuthClick,
}: Props) {
    const { itemCount } = useCartStore();
    const [scrolled, setScrolled] = useState(false);
    const { theme_settings: s } = business;
    const ctaLabel = (s.cta_text as string | undefined) || 'Get Instant Access';
    const b        = { business: business.slug };

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleCartClick = () => router.visit(checkout(b).url);
    const showAccountMenu = loginMode !== 'none' && isAuthenticated && customer;

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 bg-white transition-shadow duration-200 ${
                scrolled ? 'shadow-sm' : ''
            }`}
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between border-b border-zinc-100 px-6 lg:px-8">

                <Link href={show(b).url} className="flex shrink-0 items-center gap-2">
                    {business.logo_url ? (
                        <img
                            src={business.logo_url}
                            alt={business.name}
                            className="h-7 w-auto object-contain"
                        />
                    ) : (
                        <span className="text-base font-bold tracking-tight text-zinc-900">
                            {business.name}
                        </span>
                    )}
                </Link>

                <div className="flex items-center gap-3">
                    {catalogMode && itemCount > 0 && (
                        <button
                            type="button"
                            onClick={handleCartClick}
                            className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
                            aria-label="View cart"
                        >
                            <ShoppingBag className="h-5 w-5" />
                            <span
                                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                                style={{ backgroundColor: accent }}
                            >
                                {itemCount > 9 ? '9+' : itemCount}
                            </span>
                        </button>
                    )}

                    {loginMode !== 'none' && !isAuthenticated && (
                        <button
                            type="button"
                            onClick={onAuthClick}
                            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                        >
                            Sign in
                        </button>
                    )}

                    {showAccountMenu && (
                        <AccountMenu
                            customer={customer}
                            accent={accent}
                            businessSlug={business.slug}
                        />
                    )}

                    <button
                        type="button"
                        onClick={handleCartClick}
                        className="rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-95"
                        style={{ backgroundColor: accent }}
                    >
                        {ctaLabel}
                    </button>
                </div>
            </div>
        </header>
    );
}
