import { Suspense } from 'react';
import { THEME_MAP } from '@/types/theme';
import StorefrontHead from '@/Themes/Shared/StorefrontHead';
import type { Business, CustomerAddress, Order, Page } from '@/types/business';

type Section = 'orders' | 'payments' | 'addresses' | 'profile' | 'order' | 'payment';

type PaginatedOrders = {
    data:          Order[];
    total:         number;
    per_page:      number;
    current_page:  number;
    last_page:     number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

type FilterState = {
    status:    string;
    search:    string;
    date:      string;
    date_from: string;
    date_to:   string;
};

type Props = {
    business:   Business;
    pages:      Page[];
    section:    Section;
    orders?:    PaginatedOrders;
    payments?:  PaginatedOrders;
    order?:     Order;
    addresses?: CustomerAddress[];
    filters?:   FilterState;
};

export default function StorefrontAccount({ business, pages, section, orders, payments, order, addresses, filters }: Props) {
    const theme   = THEME_MAP[business.theme_id as keyof typeof THEME_MAP] ?? THEME_MAP['classic'];
    const Account = theme.Account;

    return (
        <Suspense fallback={null}>
            <StorefrontHead business={business} title="My Account" />
            <Account
                business={business}
                pages={pages}
                section={section}
                orders={orders}
                payments={payments}
                order={order}
                addresses={addresses}
                filters={filters}
            />
        </Suspense>
    );
}
