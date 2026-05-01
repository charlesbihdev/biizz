import { CreditCard } from 'lucide-react';

export function PaymentsEmptyState({ isDigital }: { isDigital: boolean }) {
    return (
        <div className="rounded-2xl border border-site-border bg-site-surface p-12 text-center">
            <CreditCard className="mx-auto mb-3 h-8 w-8 text-site-muted" />
            <p className="text-sm font-medium text-site-fg">No payments found</p>
            <p className="mt-1 text-xs text-site-muted">
                {isDigital
                    ? 'Sales-based payments will appear here once buyers complete checkout.'
                    : 'Payments will appear here as customers complete checkout.'}
            </p>
        </div>
    );
}
