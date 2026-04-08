import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';

export default function LandingNav() {
    const [stuck, setStuck] = useState(false);

    useEffect(() => {
        const handler = () => setStuck(window.scrollY > 60);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

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
                <span className="text-lg font-bold tracking-tight text-site-fg">
                    biizz<span className="text-brand">.</span>app
                </span>

                <nav className="hidden items-center gap-8 md:flex">
                    {['Features', 'Pricing', 'Docs', 'Marketplace'].map(
                        (item) => (
                            <Link
                                key={item}
                                href={`${item.toLowerCase()}`}
                                className="text-sm text-site-muted transition hover:text-site-fg"
                            >
                                {item}
                            </Link>
                        ),
                    )}
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
