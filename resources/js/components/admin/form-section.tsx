import { ReactNode } from 'react';

export function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-site-muted">{title}</p>
                {description && <p className="mt-0.5 text-xs text-site-muted">{description}</p>}
            </div>
            <div className="rounded-2xl border border-site-border bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-5">{children}</div>
            </div>
        </div>
    );
}
