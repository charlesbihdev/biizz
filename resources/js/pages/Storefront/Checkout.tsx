import { Suspense } from 'react';
import { THEME_MAP } from '@/types/theme';
import StorefrontHead from '@/Themes/Shared/StorefrontHead';
import type { Business, Page } from '@/types/business';

type Props = {
    business:    Business;
    pages:       Page[];
    hasPaystack: boolean;
    hasJunipay:  boolean;
};

export default function StorefrontCheckout({ business, pages, hasPaystack, hasJunipay }: Props) {
    const theme = THEME_MAP[business.theme_id as keyof typeof THEME_MAP] ?? THEME_MAP['classic'];
    const Checkout = theme.Checkout;

    return (
        <Suspense fallback={null}>
            <StorefrontHead business={business} title="Checkout" />
            <Checkout business={business} pages={pages} hasPayment={hasPaystack || hasJunipay} />
        </Suspense>
    );
}
