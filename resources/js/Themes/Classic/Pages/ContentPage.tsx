import { ChevronLeft, FileText } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import ClassicThemeShell from '../ThemeShell';
import type { Business, Page } from '@/types/business';
import TiptapRenderer from '@/components/TiptapRenderer';

interface Props {
    business: Business;
    page: Page;
    pages: Page[];
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

function PageContent({
    business,
    page,
    pages,
}: {
    business: Business;
    page: Page;
    pages: Page[];
}) {
    const { theme_settings: s, slug } = business;
    const primary = s.primary_color ?? '#1a1a1a';
    const textMuted = primary + 'b3';

    return (
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-12 lg:py-10">
            <nav
                className="mb-6 flex items-center gap-2 text-sm"
                style={{ color: textMuted }}
            >
                <Link
                    href={`/s/${slug}`}
                    className="flex items-center gap-1 transition-colors hover:text-site-fg"
                    style={{ color: textMuted }}
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Home
                </Link>
                <span className="opacity-40">/</span>
                <span style={{ color: primary }} className="font-medium">
                    {pageLabel(page)}
                </span>
            </nav>

            <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
                <aside className="hidden w-64 shrink-0 lg:block">
                    <div className="sticky top-32 space-y-8">
                        <div>
                            <h3 className="mb-4 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                                Information
                            </h3>
                            <nav className="flex flex-col gap-1">
                                {pages.map((p) => {
                                    const isActive = p.id === page.id;
                                    return (
                                        <Link
                                            key={p.id}
                                            href={`/s/${slug}/pages/${p.slug}`}
                                            className={cn(
                                                'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                                                isActive
                                                    ? 'bg-zinc-100 shadow-sm'
                                                    : 'hover:bg-zinc-50',
                                            )}
                                            style={{
                                                color: isActive
                                                    ? primary
                                                    : textMuted,
                                            }}
                                        >
                                            <FileText
                                                className={cn(
                                                    'h-4 w-4 transition-transform group-hover:scale-110',
                                                    isActive
                                                        ? 'opacity-100'
                                                        : 'opacity-40',
                                                )}
                                            />
                                            {pageLabel(p)}
                                        </Link>
                                    );
                                })}
                                <Link
                                    href={`/s/${slug}/contact`}
                                    className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:bg-zinc-50"
                                    style={{ color: textMuted }}
                                >
                                    <FileText className="h-4 w-4 opacity-40 transition-transform group-hover:scale-110" />
                                    Contact Us
                                </Link>
                            </nav>
                        </div>

                        <div className="rounded-3xl border border-zinc-100 bg-zinc-50/50 p-6">
                            <h4
                                className="mb-2 text-sm font-bold"
                                style={{ color: primary }}
                            >
                                {business.name}
                            </h4>
                            <p
                                className="text-xs leading-relaxed"
                                style={{ color: textMuted }}
                            >
                                {business.description ||
                                    'Thank you for shopping with us. We value your trust and strive to provide the best service.'}
                            </p>
                        </div>
                    </div>
                </aside>

                <article className="min-w-0 flex-1">
                    <div className="max-w-4xl">
                        {page.content ? (
                            <TiptapRenderer
                                content={page.content}
                                primaryColor={primary}
                                className="sm:prose-lg"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 py-20 text-center">
                                <FileText className="mb-4 h-12 w-12 text-zinc-200" />
                                <p style={{ color: textMuted }}>
                                    No content has been added to this page yet.
                                </p>
                            </div>
                        )}
                    </div>
                </article>
            </div>
        </main>
    );
}

export default function ContentPage({ business, page, pages }: Props) {
    return (
        <ClassicThemeShell business={business} pages={pages}>
            <PageContent business={business} page={page} pages={pages} />
        </ClassicThemeShell>
    );
}
