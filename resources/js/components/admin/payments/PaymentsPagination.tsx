import { Link } from '@inertiajs/react';

type Props = {
    prev: string | null;
    next: string | null;
    current: number;
    last: number;
};

export function PaymentsPagination({ prev, next, current, last }: Props) {
    if (!prev && !next) return null;
    return (
        <div className="mt-4 flex justify-between">
            <Link
                href={prev ?? '#'}
                className={`text-sm font-medium ${prev ? 'text-brand hover:underline' : 'pointer-events-none text-site-muted'}`}
            >
                ← Previous
            </Link>
            <span className="text-sm text-site-muted">
                Page {current} of {last}
            </span>
            <Link
                href={next ?? '#'}
                className={`text-sm font-medium ${next ? 'text-brand hover:underline' : 'pointer-events-none text-site-muted'}`}
            >
                Next →
            </Link>
        </div>
    );
}
