import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { OrderStatus } from './types';

export function StatusBadge({ status }: { status: OrderStatus }) {
    const config: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
        pending:   { label: 'Pending',   color: '#f59e0b', icon: <Clock className="h-3 w-3" /> },
        paid:      { label: 'Paid',      color: '#22c55e', icon: <CheckCircle className="h-3 w-3" /> },
        fulfilled: { label: 'Fulfilled', color: '#3b82f6', icon: <CheckCircle className="h-3 w-3" /> },
        cancelled: { label: 'Cancelled', color: '#71717a', icon: <XCircle className="h-3 w-3" /> },
        refunded:  { label: 'Refunded',  color: '#71717a', icon: <XCircle className="h-3 w-3" /> },
    };

    const { label, color, icon } = config[status] ?? config.pending;

    return (
        <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: color }}
        >
            {icon}
            {label}
        </span>
    );
}
