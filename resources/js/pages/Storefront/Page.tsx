import { Suspense } from 'react';
import { THEME_MAP } from '@/types/theme';
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

export default function StorefrontPage({ business, page, pages }: Props) {
    const PageComponent = THEME_MAP[business.theme_id as keyof typeof THEME_MAP]?.Page;

    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-zinc-400">Loading...</div>}>
            <StorefrontHead
                business={business}
                title={page.title}
                description={stripHtml(page.content) || undefined}
            />
            <PageComponent business={business} page={page} pages={pages} />
        </Suspense>
    );
}
