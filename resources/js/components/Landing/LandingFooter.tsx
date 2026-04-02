import { Link } from '@inertiajs/react';

export default function LandingFooter() {
    return (
        <footer className="border-t border-site-border bg-site-bg px-6 py-8">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
                <span className="text-sm font-bold text-site-fg">
                    biizz<span className="text-brand">.</span>app
                </span>
                <p className="text-xs text-site-muted">
                    © {new Date().getFullYear()} biizz.app. The e-commerce OS for entrepreneurs.
                </p>
                <div className="flex gap-6 text-xs text-site-muted">
                    <Link href="/privacy" className="transition hover:text-site-fg">Privacy</Link>
                    <Link href="/terms" className="transition hover:text-site-fg">Terms</Link>
                    <Link href="/contact" className="transition hover:text-site-fg">Contact</Link>
                </div>
            </div>
        </footer>
    );
}
