import type { CSSProperties } from 'react';
import { ChevronLeft } from 'lucide-react';
import ClassicThemeShell from '../ThemeShell';
import type { Business, Page } from '@/types/business';

interface Props {
    business: Business;
    page:     Page;
    pages:    Page[];
}

function PageContent({ business, page }: { business: Business; page: Page }) {
    const { theme_settings: s } = business;
    const primary   = s.primary_color ?? '#1a1a1a';
    const textMuted = primary + 'b3';

    return (
        <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
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

export default function ContentPage({ business, page, pages }: Props) {
    return (
        <ClassicThemeShell business={business} pages={pages}>
            <PageContent business={business} page={page} />
        </ClassicThemeShell>
    );
}
