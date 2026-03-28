import { Suspense } from 'react';
import { THEME_MAP } from '@/types/theme';
import StorefrontHead from '@/Themes/Shared/StorefrontHead';
import type { Business, Order, Page } from '@/types/business';

type Props = {
    business: Business;
    order:    Order | null;
    pages:    Page[];
};

export default function StorefrontCheckoutSuccess({ business, order, pages }: Props) {
    const theme = THEME_MAP[business.theme_id as keyof typeof THEME_MAP] ?? THEME_MAP['classic'];
    const CheckoutSuccess = theme.CheckoutSuccess;

    return (
        <Suspense fallback={null}>
            <StorefrontHead business={business} title="Order Complete" />
            <CheckoutSuccess business={business} order={order} pages={pages} />
        </Suspense>
    );
}
