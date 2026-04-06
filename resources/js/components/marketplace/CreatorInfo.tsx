import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { show as catalogShow } from '@/routes/catalog';

interface Props {
    name: string;
    slug: string;
    logoUrl: string | null;
    description?: string | null;
}

function Initials({ name }: { name: string }) {
    const parts = name.trim().split(/\s+/);
    const letters = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
            {letters}
        </div>
    );
}

export default function CreatorInfo({ name, slug, logoUrl, description }: Props) {
    return (
        <div className="rounded-2xl border border-site-border bg-site-surface p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-site-muted">Creator</p>
            <div className="flex items-start gap-3">
                {logoUrl ? (
                    <img src={logoUrl} alt={name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                    <Initials name={name} />
                )}
                <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                    <p className="truncate text-sm font-semibold text-site-fg">{name}</p>
                    {description && (
                        <p className="line-clamp-2 text-xs leading-relaxed text-site-muted">{description}</p>
                    )}
                </div>
            </div>
            <Link
                href={catalogShow({ business: slug }).url}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-site-border py-2 text-xs font-medium text-site-muted transition hover:border-brand hover:text-brand"
            >
                Visit their store
                <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
        </div>
    );
}
