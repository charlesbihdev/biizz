import { Link } from '@inertiajs/react';

const STAGGER = [
    'animation-delay-[0ms]',
    'animation-delay-[120ms]',
    'animation-delay-[240ms]',
    'animation-delay-[360ms]',
];

export default function HeroSection() {
    return (
        <section className="relative flex min-h-screen items-center overflow-hidden bg-site-bg bg-grid px-6 pt-16">

            {/* Ambient warmth — barely-there coral tint, not a glow */}
            <div
                className="pointer-events-none absolute left-1/2 top-1/3 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                    background: 'radial-gradient(circle, oklch(0.55 0.19 26 / 5%) 0%, transparent 60%)',
                }}
            />

            <div className="relative z-10 mx-auto max-w-4xl text-center">

                {/* Badge */}
                <div className={`animate-fade-up ${STAGGER[0]} mb-6 inline-flex items-center gap-2 rounded-full border border-site-border bg-site-surface px-4 py-1.5`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                    <span className="text-xs font-medium tracking-wide text-site-muted uppercase">
                        E-commerce OS for Africa
                    </span>
                </div>

                {/* Headline */}
                <h1 className={`animate-fade-up ${STAGGER[1]} text-5xl font-bold leading-[1.1] tracking-tight text-site-fg sm:text-6xl lg:text-7xl`}>
                    Sell like a brand.{' '}
                    <span
                        className="bg-clip-text text-transparent"
                        style={{ backgroundImage: 'linear-gradient(135deg, oklch(0.55 0.19 26), oklch(0.45 0.18 18))' }}
                    >
                        Run like a business.
                    </span>
                </h1>

                {/* Subtitle */}
                <p className={`animate-fade-up ${STAGGER[2]} mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-site-muted`}>
                    One platform. Multiple storefronts. Built-in payments, an AI agent that sells on WhatsApp,
                    and themes designed for the way African merchants actually work.
                </p>

                {/* CTAs */}
                <div className={`animate-fade-up ${STAGGER[3]} mt-10 flex flex-wrap items-center justify-center gap-4`}>
                    <Link
                        href="/register"
                        className="rounded-full bg-brand px-8 py-3.5 text-sm font-bold text-white transition hover:bg-brand-hover"
                    >
                        Create your store — it's free
                    </Link>
                    <a
                        href="#features"
                        className="rounded-full border border-site-border px-8 py-3.5 text-sm font-medium text-site-fg transition hover:border-brand hover:text-brand"
                    >
                        See how it works
                    </a>
                </div>

                <p className={`animate-fade-up ${STAGGER[3]} mt-6 text-xs text-site-muted`}>
                    Trusted by early merchants in Ghana · Nigeria · Kenya
                </p>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="flex h-8 w-5 items-start justify-center rounded-full border border-site-border pt-1.5">
                    <div className="h-1.5 w-1 rounded-full bg-brand" />
                </div>
            </div>
        </section>
    );
}
