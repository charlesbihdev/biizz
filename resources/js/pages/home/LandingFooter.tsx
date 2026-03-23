export default function LandingFooter() {
    return (
        <footer className="border-t border-site-border bg-site-bg px-6 py-8">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
                <span className="text-sm font-bold text-site-fg">
                    biizz<span className="text-brand">.</span>app
                </span>
                <p className="text-xs text-site-muted">
                    © {new Date().getFullYear()} biizz.app — Built for African commerce.
                </p>
                <div className="flex gap-6 text-xs text-site-muted">
                    <a href="#" className="hover:text-site-fg transition">Privacy</a>
                    <a href="#" className="hover:text-site-fg transition">Terms</a>
                    <a href="#" className="hover:text-site-fg transition">Contact</a>
                </div>
            </div>
        </footer>
    );
}
