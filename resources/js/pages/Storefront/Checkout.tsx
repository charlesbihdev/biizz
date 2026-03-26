import { Suspense } from 'react';
import { THEME_MAP } from '@/types/theme';
import StorefrontHead from '@/Themes/Shared/StorefrontHead';
import type { Business, Page } from '@/types/business';

type Props = {
    business: Business;
    pages:    Page[];
};

export default function StorefrontCheckout({ business, pages }: Props) {
    const Checkout = THEME_MAP[business.theme_id as keyof typeof THEME_MAP]?.Checkout;

    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-zinc-400">Loading...</div>}>
            <StorefrontHead business={business} title="Checkout" />
            <Checkout business={business} pages={pages} />
        </Suspense>
    );
}
