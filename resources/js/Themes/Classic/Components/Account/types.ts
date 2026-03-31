import type { Business, CustomerAddress, Order, OrderStatus, Page } from '@/types/business';

export type { Business, CustomerAddress, Order, OrderStatus, Page };

export type Section = 'orders' | 'payments' | 'addresses' | 'profile';

export type PaginatedOrders = {
    data:          Order[];
    total:         number;
    per_page:      number;
    current_page:  number;
    last_page:     number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

export type FilterState = {
    status:    string;
    search:    string;
    date:      string;
    date_from: string;
    date_to:   string;
};

export interface AccountProps {
    business:   Business;
    pages:      Page[];
    section:    Section;
    orders?:    PaginatedOrders;
    payments?:  PaginatedOrders;
    addresses?: CustomerAddress[];
    filters?:   FilterState;
}
