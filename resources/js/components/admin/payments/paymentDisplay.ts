import type { PaymentGateway, PaymentStatus } from '@/types';

export const STATUS_STYLES: Record<PaymentStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    success: 'bg-emerald-100 text-emerald-800',
    failed:  'bg-red-100 text-red-700',
};

export const GATEWAY_STYLES: Record<PaymentGateway, string> = {
    paystack: 'bg-sky-100 text-sky-800',
    junipay:  'bg-violet-100 text-violet-800',
};

export const fmtAmount = (amount: string, currency: string) =>
    `${currency} ${parseFloat(amount).toFixed(2)}`;
