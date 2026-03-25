import type { CSSProperties } from 'react';
import { ChevronLeft } from 'lucide-react';
import ClassicThemeShell from '@/Themes/Classic/ThemeShell';
import BoutiqueThemeShell from '@/Themes/Boutique/ThemeShell';
import StorefrontHead from '@/Themes/Shared/StorefrontHead';
import type { Business, Page } from '@/types/business';

function stripHtml(html: string | null | undefined): string {
    if (!html) { return ''; }
    return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 155);
}

type Props = {
    business: Business;
    page:     Page;
    pages:    Page[];
};

function PageContent({ business, page }: { business: Business; page: Page }) {
    const { theme_settings: s } = business;
    const primary   = s.primary_color ?? '#1a1a1a';
    const textMuted = primary + 'b3'; // 70%

    return (
        <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center gap-2 text-sm" style={{ color: textMuted }}>
                <a
                    href={`/s/${business.slug}`}
                    className="flex items-center gap-1 transition"
                    style={{ color: textMuted }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = primary; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = textMuted; }}
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Home
                </a>
                <span>/</span>
                <span style={{ color: primary }}>{page.title}</span>
            </nav>

            <h1 className="mb-8 text-3xl font-bold leading-snug" style={{ color: primary }}>
                {page.title}
            </h1>

            {page.content ? (
                <div
                    className="prose max-w-none"
                    style={{ '--tw-prose-body': primary + 'cc', '--tw-prose-headings': primary } as CSSProperties}
                    dangerouslySetInnerHTML={{ __html: page.content }}
                />
            ) : (
                <p style={{ color: textMuted }}>No content yet.</p>
            )}
        </main>
    );
}

export default function StorefrontPage({ business, page, pages }: Props) {
    const head = (
        <StorefrontHead
            business={business}
            title={page.title}
            description={stripHtml(page.content) || undefined}
        />
    );

    if (business.theme_id === 'boutique') {
        return (
            <>
                {head}
                <BoutiqueThemeShell business={business} pages={pages}>
                    <PageContent business={business} page={page} />
                </BoutiqueThemeShell>
            </>
        );
    }

    return (
        <>
            {head}
            <ClassicThemeShell business={business} pages={pages}>
                <PageContent business={business} page={page} />
            </ClassicThemeShell>
        </>
    );
}
