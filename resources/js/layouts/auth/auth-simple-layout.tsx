import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-site-bg bg-grid p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={home().url} className="text-xl font-bold tracking-tight text-site-fg">
                            biizz<span className="text-brand">.</span>app
                        </Link>

                        <div className="space-y-1.5 text-center">
                            <h1 className="text-xl font-bold text-site-fg">{title}</h1>
                            <p className="text-center text-sm text-site-muted">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-site-border bg-white p-8 shadow-sm">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
