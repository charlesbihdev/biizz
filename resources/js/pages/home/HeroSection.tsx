import { Link } from '@inertiajs/react';

// Inline styles guarantee animation-delay fires regardless of Tailwind purge.
const STAGGER: React.CSSProperties[] = [
    { animationDelay: '0ms' },
    { animationDelay: '120ms' },
    { animationDelay: '240ms' },
    { animationDelay: '360ms' },
];

export default function HeroSection() {
    return (
        <section className="relative flex min-h-screen items-center overflow-hidden bg-site-bg bg-grid px-6 pt-16">

            {/* Ambient warmth — barely-there amber tint */}
            <div
                className="pointer-events-none absolute left-1/2 top-1/3 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                    background: 'radial-gradient(circle, oklch(0.65 0.16 58 / 6%) 0%, transparent 60%)',
                }}
            />

            <div className="relative z-10 mx-auto max-w-4xl text-center">

                {/* Badge */}
                <div
                    className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-site-border bg-site-surface px-4 py-1.5"
                    style={STAGGER[0]}
                >
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                    <span className="text-xs font-medium uppercase tracking-wide text-site-muted">
                        E-commerce OS for Entrepreneurs
                    </span>
                </div>

                {/* Headline */}
                <h1
                    className="animate-fade-up text-5xl font-bold leading-[1.1] tracking-tight text-site-fg sm:text-6xl lg:text-7xl"
                    style={STAGGER[1]}
                >
                    Set up once.{' '}
                    <span
                        className="bg-clip-text text-transparent"
                        style={{ backgroundImage: 'linear-gradient(135deg, oklch(0.65 0.16 58), oklch(0.52 0.14 45))' }}
                    >
                        Your AI sells for you.
                    </span>
                </h1>

                {/* Subtitle */}
                <p
                    className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-site-muted"
                    style={STAGGER[2]}
                >
                    One platform. Your own online store, built-in payments, and an AI that sells for you on WhatsApp while you sleep.
                </p>

                {/* CTAs */}
                <div
                    className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-4"
                    style={STAGGER[3]}
                >
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

                <p
                    className="animate-fade-up mt-6 text-xs text-site-muted"
                    style={STAGGER[3]}
                >
                    Trusted by early merchants in Ghana · Nigeria · Kenya
                </p>
            </div>

            {/* Scroll indicator — mouse icon with bouncing dot */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <div className="flex h-9 w-6 items-start justify-center rounded-full border-2 border-site-border pt-2">
                    <div className="h-1.5 w-1 animate-bounce rounded-full bg-brand" />
                </div>
            </div>
        </section>
    );
}
