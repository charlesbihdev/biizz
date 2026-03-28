import { Suspense } from 'react';
import { THEME_MAP } from '@/types/theme';
import StorefrontHead from '@/Themes/Shared/StorefrontHead';
import type { Business, Page } from '@/types/business';

type Props = {
    business: Business;
    pages:    Page[];
};

export default function StorefrontContact({ business, pages }: Props) {
    const Contact = THEME_MAP[business.theme_id as keyof typeof THEME_MAP]?.Contact;

    return (
        <Suspense fallback={null}>
            <StorefrontHead business={business} title="Contact Us" />
            <Contact business={business} pages={pages} />
        </Suspense>
    );
}
