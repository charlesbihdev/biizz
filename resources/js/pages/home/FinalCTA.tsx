import { Link } from '@inertiajs/react';

export default function FinalCTA() {
    return (
        <section className="relative overflow-hidden bg-site-bg px-6 py-32">

            {/* Subtle teal glow on white */}
            <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: 'radial-gradient(circle, oklch(0.65 0.155 175 / 7%) 0%, transparent 65%)' }}
            />

            <div className="relative z-10 mx-auto max-w-2xl text-center">
                <h2 className="text-4xl font-bold text-site-fg sm:text-5xl">
                    Your business deserves a proper storefront.
                </h2>
                <p className="mt-4 text-lg text-site-muted">
                    Set up in minutes. No credit card required.
                </p>

                <Link
                    href="/register"
                    className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand px-10 py-4 text-base font-bold text-white transition hover:bg-brand-hover"
                >
                    Create your store — it's free
                    <span aria-hidden>→</span>
                </Link>

                <p className="mt-4 text-xs text-site-muted">
                    Paystack · Junipay · WhatsApp AI · Meta Pixel — all included
                </p>
            </div>
        </section>
    );
}
