import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const NAV_ITEMS: { label: string; href: string }[] = [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Marketplace', href: '/marketplace' },
];

export default function LandingNav() {
    const { url } = usePage();
    const [stuck, setStuck] = useState(false);

    useEffect(() => {
        const handler = () => setStuck(window.scrollY > 60);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    // Inertia's `url` is the path + query (e.g. "/pricing?ref=foo"). We
    // match the pathname only so query strings don't break highlighting,
    // and use `startsWith` so nested routes (e.g. /marketplace/foo) keep
    // the parent link active.
    const pathname = url.split('?')[0] ?? '/';
    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

    return (
        <header
            className={[
                'fixed top-0 right-0 left-0 z-50 transition-all duration-300',
                stuck
                    ? 'animate-nav-in border-b border-site-border bg-site-bg/90 shadow-sm backdrop-blur-md'
                    : 'bg-transparent',
            ].join(' ')}
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                <Link href="/" className="text-lg font-bold tracking-tight text-site-fg">
                    biizz<span className="text-brand">.</span>app
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    {NAV_ITEMS.map(({ label, href }) => {
                        const active = isActive(href);
                        return (
                            <Link
                                key={label}
                                href={href}
                                className={`relative text-sm transition ${
                                    active
                                        ? 'font-semibold text-site-fg'
                                        : 'text-site-muted hover:text-site-fg'
                                }`}
                            >
                                {label}
                                {active && (
                                    <span
                                        aria-hidden="true"
                                        className="absolute -bottom-1 left-0 right-0 mx-auto h-0.5 w-6 rounded-full bg-brand"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="text-sm text-site-muted transition hover:text-site-fg"
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
                    >
                        Get started
                    </Link>
                </div>
            </div>
        </header>
    );
}
