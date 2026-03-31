import { Link } from '@inertiajs/react';
import { MessageCircle, Search, X } from 'lucide-react';
import React from 'react';
import StorefrontController from '@/actions/App/Http/Controllers/StorefrontController';
import { show as account } from '@/actions/App/Http/Controllers/CustomerAccountController';
import type { Page } from '@/types/business';

interface MobileDrawerProps {
    isOpen:             boolean;
    onClose:            () => void;
    searchQuery:        string;
    setSearchQuery:     (q: string) => void;
    handleSearch:       (e: React.FormEvent) => void;
    slug:               string;
    accent:             string;
    categories:         { id: number; name: string; slug: string }[];
    activeCategorySlug: string | null;
    pages:              Page[];
    pageLabel:          (page: Page) => string;
    isAuthenticated:    boolean;
    whatsappHref:       string | null;
}

export function MobileDrawer({
    isOpen,
    onClose,
    searchQuery,
    setSearchQuery,
    handleSearch,
    slug,
    accent,
    categories,
    activeCategorySlug,
    pages,
    pageLabel,
    isAuthenticated,
    whatsappHref,
}: MobileDrawerProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />
            <div className="relative flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                    <span className="font-semibold text-zinc-900">Menu</span>
                    <button
                        type="button"
                        onClick={onClose}
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
                            onChange={(e) => setSearchQuery(e.target.value)}
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
    );
}

export function DrawerSection({
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

export function DrawerLink({
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
