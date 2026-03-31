import React from 'react';
import { Home } from 'lucide-react';
import NavLink from './NavLink';
import type { Page } from '@/types/business';
import StorefrontController from '@/actions/App/Http/Controllers/StorefrontController';

interface CategoryNavProps {
    slug:               string;
    primary:            string;
    accent:             string;
    categories:         { id: number; name: string; slug: string }[];
    activeCategorySlug: string | null;
    pages:              Page[];
    pageLabel:          (page: Page) => string;
    showShopPage:       boolean;
}

export default function CategoryNav({
    slug,
    primary,
    accent,
    categories,
    activeCategorySlug,
    pages,
    pageLabel,
    showShopPage,
}: CategoryNavProps) {
    return (
        <div className="border-b border-zinc-100 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none]">
                        <NavLink
                            href={StorefrontController.show.url(slug)}
                            active={
                                !activeCategorySlug &&
                                typeof window !== 'undefined' &&
                                window.location.pathname === StorefrontController.show.url(slug)
                            }
                            accent={accent}
                            primary={primary}
                            icon={<Home className="h-3.5 w-3.5" />}
                        >
                            Home
                        </NavLink>
                        {showShopPage && (
                            <NavLink
                                href={StorefrontController.shop.url(slug)}
                                active={
                                    typeof window !== 'undefined' &&
                                    window.location.pathname === StorefrontController.shop.url(slug)
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
                                    window.location.pathname === StorefrontController.contact.url(slug)
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
                                        window.location.pathname === StorefrontController.page.url({ business: slug, page: page.slug })
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
    );
}
