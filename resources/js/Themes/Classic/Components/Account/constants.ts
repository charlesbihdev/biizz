export const DATE_PRESETS = [
    { value: 'all',        label: 'All time' },
    { value: 'today',      label: 'Today' },
    { value: 'yesterday',  label: 'Yesterday' },
    { value: 'this_week',  label: 'This week' },
    { value: 'last_week',  label: 'Last week' },
    { value: 'this_month', label: 'This month' },
    { value: 'last_month', label: 'Last month' },
    { value: 'this_year',  label: 'This year' },
    { value: 'last_year',  label: 'Last year' },
    { value: 'custom',     label: 'Custom range' },
] as const;

export const ORDER_STATUS_TABS   = ['all', 'pending', 'paid', 'fulfilled', 'cancelled', 'refunded'] as const;
export const PAYMENT_STATUS_TABS = ['all', 'pending', 'paid'] as const;
