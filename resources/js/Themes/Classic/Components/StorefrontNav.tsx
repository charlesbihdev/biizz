import { Link, router } from '@inertiajs/react';
import StorefrontController from '@/actions/App/Http/Controllers/StorefrontController';
import { show as account } from '@/actions/App/Http/Controllers/CustomerAccountController';
import { destroy as logoutRoute } from '@/actions/App/Http/Controllers/StorefrontAuth/LogoutController';
import { useEffect, useState } from 'react';
import {
    Facebook,
    Home,
    Instagram,
    LogOut,
    Menu,
    MessageCircle,
    Search,
    ShoppingCart,
    Twitter,
    User,
    X,
} from 'lucide-react';
import type { Business, CustomerLoginMode, Page } from '@/types/business';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';
import { useSearch } from '@/Themes/Shared/Hooks/useSearch';

interface Props {
    business:        Business;
    pages:           Page[];
    itemCount:       number;
    onCartOpen:      () => void;
    onAuthOpen:      () => void;
    isAuthenticated: boolean;
    loginMode:       CustomerLoginMode;
}

const PAGE_LABELS: Record<string, string> = {
    privacy_policy: 'Privacy Policy',
    faq: 'FAQ',
    terms: 'Terms',
    about: 'About',
    shipping: 'Shipping',
    acceptable_use: 'Acceptable Use',
};

function pageLabel(page: Page): string {
    return page.type ? (PAGE_LABELS[page.type] ?? page.title) : page.title;
}

export default function StorefrontNav({
    business,
    pages,
    itemCount,
    onCartOpen,
    onAuthOpen,
    isAuthenticated,
    loginMode,
}: Props) {
    const { customer } = useCustomerAuth();
    const [scrolled, setScrolled] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const {
        theme_settings: s,
        name,
        logo_url,
        slug,
        social_links: social,
    } = business;
    const primary = s.primary_color ?? '#1a1a1a';
    const accent = s.accent_color ?? primary;
    const categories = business.categories ?? [];
    const whatsapp = social?.whatsapp;
    const whatsappHref = whatsapp
        ? `https://wa.me/${whatsapp.replace(/\D/g, '')}`
        : null;

    const {
        query: searchQuery,
        setQuery: setSearchQuery,
        handleSubmit: handleSearch,
    } = useSearch(slug, {
        target: StorefrontController.shop.url(slug),
    });

    const activeCategorySlug =
        typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('category')
            : null;

    const hasTier1 = !!(
        whatsappHref ||
        social?.instagram ||
        social?.facebook ||
        social?.tiktok ||
        social?.twitter
    );

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [drawerOpen]);

    const socialIcons = [
        social?.facebook && {
            Icon: Facebook,
            href: social.facebook.startsWith('http')
                ? social.facebook
                : `https://facebook.com/${social.facebook}`,
            label: 'Facebook',
        },
        social?.instagram && {
            Icon: Instagram,
            href: social.instagram.startsWith('http')
                ? social.instagram
                : `https://instagram.com/${social.instagram.replace(/^@/, '')}`,
            label: 'Instagram',
        },
        social?.twitter && {
            Icon: Twitter,
            href: social.twitter.startsWith('http')
                ? social.twitter
                : `https://twitter.com/${social.twitter.replace(/^@/, '')}`,
            label: 'X / Twitter',
        },
    ].filter(Boolean) as {
        Icon: React.ElementType;
        href: string;
        label: string;
    }[];

    return (
        <>
            <header
                className={`sticky top-0 z-40 bg-white transition-shadow ${scrolled ? 'shadow-md' : ''}`}
            >
                {/* ── Tier 1: Top bar ─────────────────────────────────────── */}
                {hasTier1 && (
                    <div
                        className="hidden border-b border-white/10 px-4 py-1.5 sm:block"
                        style={{ backgroundColor: primary }}
                    >
                        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3">
                                <Link
                                    href={StorefrontController.contact.url(slug)}
                                    className="text-xs text-white/80 transition hover:text-white"
                                >
                                    Help &amp; Support
                                </Link>
                                {socialIcons.map(({ Icon, href, label }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="text-white/70 transition hover:text-white"
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                    </a>
                                ))}
                            </div>
                            {whatsappHref && (
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-semibold text-white transition hover:bg-white/30"
                                >
                                    <MessageCircle className="h-3 w-3" />
                                    WhatsApp
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Tier 2: Main header ─────────────────────────────────── */}
                <div className="border-b border-zinc-100 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto grid h-20 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 lg:h-24">
                        {/* Left: hamburger (mobile) + logo */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDrawerOpen(true)}
                                aria-label="Open menu"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 lg:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <Link
                                href={StorefrontController.show.url(slug)}
                                className="shrink-0 transition-opacity hover:opacity-80"
                            >
                                {logo_url ? (
                                    <img
                                        src={logo_url}
                                        alt={name}
                                        className="h-14 w-auto max-w-[200px] object-contain lg:h-16"
                                    />
                                ) : (
                                    <span
                                        className="text-xl font-bold lg:text-2xl"
                                        style={{ color: accent }}
                                    >
                                        {name}
                                    </span>
                                )}
                            </Link>
                        </div>

                        {/* Center: search bar — truly centered via grid */}
                        <form
                            onSubmit={handleSearch}
                            className="hidden items-center sm:flex"
                        >
                            <div className="mx-auto flex w-full max-w-2xl items-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 transition focus-within:border-zinc-400 focus-within:bg-white">
                                <Search className="ml-4 h-4 w-4 shrink-0 text-zinc-400" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search for products..."
                                    className="flex-1 bg-transparent py-3 pr-2 pl-3 text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
                                />
                                <button
                                    type="submit"
                                    className="mr-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                                    style={{ backgroundColor: accent }}
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Right: account + cart */}
                        <div className="flex items-center justify-end gap-1">
                            {/* Account button — hidden when loginMode is 'none' and not logged in */}
                            {(loginMode !== 'none' || isAuthenticated) && (
                                <AccountButton
                                    customer={customer}
                                    isAuthenticated={isAuthenticated}
                                    accent={accent}
                                    businessSlug={slug}
                                    onAuthOpen={onAuthOpen}
                                />
                            )}

                            <button
                                onClick={onCartOpen}
                                aria-label="Open cart"
                                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-50"
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {itemCount > 0 && (
                                    <span
                                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] leading-none font-bold text-white"
                                        style={{ backgroundColor: accent }}
                                    >
                                        {itemCount > 9 ? '9+' : itemCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Tier 3: Category nav ────────────────────────────────── */}
                <div className="border-b border-zinc-100 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none]">
                                <NavLink
                                    href={StorefrontController.show.url(slug)}
                                    active={
                                        !activeCategorySlug &&
                                        typeof window !== 'undefined' &&
                                        window.location.pathname ===
                                            StorefrontController.show.url(slug)
                                    }
                                    accent={accent}
                                    primary={primary}
                                    icon={<Home className="h-3.5 w-3.5" />}
                                >
                                    Home
                                </NavLink>
                                {s.show_shop_page !== false && (
                                    <NavLink
                                        href={StorefrontController.shop.url(slug)}
                                        active={
                                            typeof window !== 'undefined' &&
                                            window.location.pathname ===
                                                StorefrontController.shop.url(slug)
                                        }
                                        accent={accent}
                                        primary={primary}
                                    >
                                        All Products
                                    </NavLink>
                                )}
                                {categories.map((cat) => (
                                    <NavLink
                                        key={cat.id}
                                        href={StorefrontController.show.url(slug, { query: { category: cat.slug } })}
                                        active={activeCategorySlug === cat.slug}
                                        accent={accent}
                                        primary={primary}
                                    >
                                        {cat.name}
                                    </NavLink>
                                ))}
                            </div>

                            {pages.length > 0 && (
                                <div className="hidden shrink-0 items-center lg:flex">
                                    <NavLink
                                        href={StorefrontController.contact.url(slug)}
                                        active={
                                            typeof window !== 'undefined' &&
                                            window.location.pathname ===
                                                StorefrontController.contact.url(slug)
                                        }
                                        accent={accent}
                                        primary={primary}
                                    >
                                        Contact
                                    </NavLink>
                                    {pages.slice(0, 4).map((page) => (
                                        <NavLink
                                            key={page.id}
                                            href={StorefrontController.page.url({ business: slug, page: page.slug })}
                                            active={
                                                typeof window !== 'undefined' &&
                                                window.location.pathname ===
                                                    StorefrontController.page.url({ business: slug, page: page.slug })
                                            }
                                            accent={accent}
                                            primary={primary}
                                        >
                                            {pageLabel(page)}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Mobile drawer ──────────────────────────────────────────── */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div className="relative flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                            <span className="font-semibold text-zinc-900">
                                Menu
                            </span>
                            <button
                                type="button"
                                onClick={() => setDrawerOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-4 py-4">
                            <form
                                onSubmit={handleSearch}
                                className="mb-4 flex items-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50"
                            >
                                <Search className="ml-3 h-4 w-4 shrink-0 text-zinc-400" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search…"
                                    className="flex-1 bg-transparent px-2 py-2.5 text-sm outline-none"
                                />
                            </form>

                            <DrawerSection label="Shop">
                                <DrawerLink href={StorefrontController.shop.url(slug)} accent={accent}>
                                    All Products
                                </DrawerLink>
                                {categories.map((cat) => (
                                    <DrawerLink
                                        key={cat.id}
                                        href={StorefrontController.show.url(slug, { query: { category: cat.slug } })}
                                        active={activeCategorySlug === cat.slug}
                                        accent={accent}
                                    >
                                        {cat.name}
                                    </DrawerLink>
                                ))}
                            </DrawerSection>

                            <DrawerSection label="Info">
                                <DrawerLink
                                    href={StorefrontController.contact.url(slug)}
                                    accent={accent}
                                >
                                    Contact Us
                                </DrawerLink>
                                {pages.map((page) => (
                                    <DrawerLink
                                        key={page.id}
                                        href={StorefrontController.page.url({ business: slug, page: page.slug })}
                                        accent={accent}
                                    >
                                        {pageLabel(page)}
                                    </DrawerLink>
                                ))}
                            </DrawerSection>

                            {isAuthenticated && (
                                <DrawerSection label="Account">
                                    <DrawerLink
                                        href={account.url(slug)}
                                        accent={accent}
                                    >
                                        My Account
                                    </DrawerLink>
                                </DrawerSection>
                            )}

                            {whatsappHref && (
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white"
                                    style={{ backgroundColor: '#22c55e' }}
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Chat on WhatsApp
                                </a>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}

function AccountButton({
    customer,
    isAuthenticated,
    accent,
    businessSlug,
    onAuthOpen,
}: {
    customer:        ReturnType<typeof useCustomerAuth>['customer'];
    isAuthenticated: boolean;
    accent:          string;
    businessSlug:    string;
    onAuthOpen:      () => void;
}) {
    const [open, setOpen] = useState(false);

    if (!isAuthenticated) {
        return (
            <button
                type="button"
                onClick={onAuthOpen}
                className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-semibold transition hover:opacity-90"
                style={{ backgroundColor: accent }}
                aria-label="Account menu"
            >
                {customer?.avatar ? (
                    <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="h-full w-full rounded-full object-cover"
                    />
                ) : (
                    (customer?.name?.[0] ?? '?').toUpperCase()
                )}
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-zinc-100 bg-white py-1 shadow-lg">
                        <div className="border-b border-zinc-100 px-4 py-2.5">
                            <p className="truncate text-sm font-semibold text-zinc-900">
                                {customer?.name}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                                {customer?.email}
                            </p>
                        </div>
                        <Link
                            href={account.url(businessSlug)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50"
                            onClick={() => setOpen(false)}
                        >
                            <User className="h-4 w-4" />
                            My Account
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                router.post(logoutRoute.url(businessSlug));
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

function NavLink({
    href,
    active,
    accent,
    primary,
    children,
    icon,
}: {
    href: string;
    active: boolean;
    accent: string;
    primary: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
}) {
    const inactiveColor = primary + 'b3'; // 70% opacity
    return (
        <Link
            href={href}
            className="flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-semibold transition"
            style={
                active
                    ? { color: accent, borderColor: accent }
                    : { color: inactiveColor, borderColor: 'transparent' }
            }
            onMouseEnter={(e) => {
                if (!active) {
                    e.currentTarget.style.color = primary;
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.color = inactiveColor;
                }
            }}
        >
            {icon}
            {children}
        </Link>
    );
}

function DrawerSection({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-5">
            <p className="mb-2 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                {label}
            </p>
            <div className="flex flex-col gap-0.5">{children}</div>
        </div>
    );
}

function DrawerLink({
    href,
    active,
    accent,
    children,
}: {
    href: string;
    active?: boolean;
    accent?: string;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            style={
                active && accent
                    ? { color: accent, backgroundColor: accent + '1a' }
                    : undefined
            }
        >
            {children}
        </Link>
    );
}
