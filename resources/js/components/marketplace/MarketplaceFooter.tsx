import { Link } from '@inertiajs/react';
import { index } from '@/routes/marketplace';
import { home, register } from '@/routes';

export default function MarketplaceFooter() {
    return (
        <footer className="mt-20 border-t border-site-border bg-site-bg px-5 py-10">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-2">
                        <span className="text-base font-bold text-site-fg">
                            biizz<span className="text-brand">.</span>market
                        </span>
                        <p className="max-w-xs text-xs leading-relaxed text-site-muted">
                            A marketplace of digital products built by African creators shipping real results.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-8 text-xs text-site-muted">
                        <div className="flex flex-col gap-2">
                            <span className="font-semibold uppercase tracking-wide text-site-fg">Discover</span>
                            <Link href={index().url} className="transition hover:text-site-fg">Browse all</Link>
                            <Link href={index({ tag: 'ebook' }).url} className="transition hover:text-site-fg">Ebooks</Link>
                            <Link href={index({ tag: 'course' }).url} className="transition hover:text-site-fg">Courses</Link>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="font-semibold uppercase tracking-wide text-site-fg">Sellers</span>
                            <Link href={register().url} className="transition hover:text-site-fg">Sell on biizz</Link>
                            <Link href={home().url} className="transition hover:text-site-fg">How it works</Link>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="font-semibold uppercase tracking-wide text-site-fg">Legal</span>
                            <Link href="/privacy" className="transition hover:text-site-fg">Privacy</Link>
                            <Link href="/terms" className="transition hover:text-site-fg">Terms</Link>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-site-border pt-6 text-xs text-site-muted">
                    © {new Date().getFullYear()} biizz.app. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
