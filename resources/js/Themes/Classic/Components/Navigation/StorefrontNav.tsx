import { Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import {
    Facebook,
    Instagram,
    Menu,
    MessageCircle,
    Search,
    ShoppingCart,
    Twitter,
} from 'lucide-react';
import type { Business, CustomerLoginMode, Page } from '@/types/business';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';
import { useSearch } from '@/Themes/Shared/Hooks/useSearch';
import { useSemanticTokens } from '@/Themes/Shared/Hooks/useSemanticTokens';
import StorefrontController from '@/actions/App/Http/Controllers/StorefrontController';

// Child components
import CategoryNav from './CategoryNav';
import { MobileDrawer } from './MobileDrawer';
import AccountDropdown from './AccountDropdown';

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
    const tokens = useSemanticTokens(business);

    const {
        theme_settings: s,
        name,
        logo_url,
        slug,
        social_links: social,
    } = business;
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
                        style={{ backgroundColor: tokens.ctaBg }}
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
                                        style={{ color: tokens.textPrimary }}
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
                                    value={searchQuery ?? ''}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search for products..."
                                    className="flex-1 bg-transparent py-3 pr-2 pl-3 text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
                                />
                                <button
                                    type="submit"
                                    className="mr-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                                    style={{ backgroundColor: tokens.ctaBg, color: tokens.ctaFg }}
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Right: account + cart */}
                        <div className="flex items-center justify-end gap-1">
                            {/* Account button — hidden when loginMode is 'none' and not logged in */}
                            {(loginMode !== 'none' || isAuthenticated) && (
                                <AccountDropdown
                                    customer={customer}
                                    isAuthenticated={isAuthenticated}
                                    accent={tokens.ctaBg}
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
                                        style={{ backgroundColor: tokens.ctaBg, color: tokens.ctaFg }}
                                    >
                                        {itemCount > 9 ? '9+' : itemCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Tier 3: Category nav ────────────────────────────────── */}
                <CategoryNav
                    slug={slug}
                    primary={tokens.textPrimary}
                    accent={tokens.ctaBg}
                    categories={categories}
                    activeCategorySlug={activeCategorySlug}
                    pages={pages}
                    pageLabel={pageLabel}
                    showShopPage={s.show_shop_page !== false}
                />
            </header>

            {/* ── Mobile drawer ──────────────────────────────────────────── */}
            <MobileDrawer 
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                searchQuery={searchQuery ?? ''}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
                slug={slug}
                accent={tokens.ctaBg}
                categories={categories}
                activeCategorySlug={activeCategorySlug}
                pages={pages}
                pageLabel={pageLabel}
                isAuthenticated={isAuthenticated}
                whatsappHref={whatsappHref}
            />
        </>
    );
}
