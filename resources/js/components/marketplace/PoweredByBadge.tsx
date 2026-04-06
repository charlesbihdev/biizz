import { Link } from '@inertiajs/react';
import { home } from '@/routes';

export default function PoweredByBadge() {
    return (
        <Link
            href={home().url}
            className="fixed right-4 bottom-4 z-40 flex items-center gap-1.5 rounded-full border border-site-border bg-site-bg/90 px-3 py-1.5 text-[10px] font-semibold text-site-muted opacity-70 shadow-sm backdrop-blur-sm transition hover:opacity-100 hover:text-brand"
        >
            Powered by biizz<span className="text-brand">.</span>app
        </Link>
    );
}
