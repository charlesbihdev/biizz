import { Head } from '@inertiajs/react';
import type { Business } from '@/types/business';

interface Props {
    business:    Business;
    title?:      string; // page-specific title prefix (e.g. product name, page title)
    description?: string;
    image?:      string;
}

/** Strips HTML tags and truncates to max length. */
function stripAndTruncate(html: string | null | undefined, max = 155): string {
    if (!html) { return ''; }
    return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export default function StorefrontHead({ business, title, description, image }: Props) {
    const pageTitle = title
        ? `${title} | ${business.name}`
        : (business.seo_title ?? business.name);

    const metaDescription = description
        ?? business.seo_description
        ?? stripAndTruncate(business.tagline ?? business.description);

    const ogImage       = image ?? business.seo_image ?? business.logo_url ?? undefined;
    const favicon       = business.favicon_url ?? business.logo_url ?? undefined;
    const progressColor = (business.theme_settings?.highlight_color as string | undefined)
        ?? (business.theme_settings?.primary_color as string | undefined)
        ?? null;

    return (
        <Head title={pageTitle}>
            {metaDescription && (
                <meta name="description" content={metaDescription} />
            )}

            {/* Open Graph */}
            <meta property="og:title"       content={pageTitle} />
            <meta property="og:type"        content="website" />
            {metaDescription && (
                <meta property="og:description" content={metaDescription} />
            )}
            {ogImage && (
                <meta property="og:image" content={ogImage} />
            )}

            {/* Twitter Card */}
            <meta name="twitter:card"  content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            {metaDescription && (
                <meta name="twitter:description" content={metaDescription} />
            )}
            {ogImage && (
                <meta name="twitter:image" content={ogImage} />
            )}

            {/* Favicon — overrides default biizz favicon */}
            {favicon && (
                <link rel="icon" href={favicon} />
            )}

            {/* Theme-aware progress bar — overrides Inertia's default NProgress color.
                When the user navigates away from storefront, this Head unmounts and
                the bar reverts to the app default (#4B5563) automatically. */}
            {progressColor && (
                <style>{`#nprogress .bar { background: ${progressColor} !important; }`}</style>
            )}
        </Head>
    );
}
