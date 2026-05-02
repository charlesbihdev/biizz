import type { SubscriptionTier } from './tier';

// Mirrors App\Models\SubscriptionInvoice constants.
export type SubscriptionInvoiceStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface SubscriptionInvoice {
    id: number;
    reference: string;
    tier: SubscriptionTier;
    amount: number | string;
    currency: string;
    status: SubscriptionInvoiceStatus;
    paid_at: string | null;
    period_start: string | null;
    period_end: string | null;
    created_at: string;
}
