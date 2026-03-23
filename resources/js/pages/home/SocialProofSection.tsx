const STATS = [
    { value: '200+', label: 'Early merchants' },
    { value: '4',    label: 'Countries' },
    { value: '< 5m', label: 'Setup time' },
    { value: '0',    label: 'Plugins needed' },
];

const QUOTES = [
    {
        quote: 'I set up my store in an afternoon. My customers now order directly from WhatsApp and pay without me sending a single link manually.',
        name:  'Abena K.',
        role:  'Fashion retailer, Accra',
        featured: true,
    },
    {
        quote: 'The Paystack integration alone saved me hours every week. Everything is in one place now.',
        name:  'Tunde A.',
        role:  'Electronics seller, Lagos',
        featured: false,
    },
    {
        quote: 'I went from DMs to a real storefront in one evening. My conversion rate doubled.',
        name:  'Wanjiru M.',
        role:  'Skincare brand, Nairobi',
        featured: false,
    },
];

export default function SocialProofSection() {
    const [featured, ...rest] = QUOTES;

    return (
        <section className="border-y border-site-border bg-site-surface px-6 py-24">
            <div className="mx-auto max-w-5xl">

                {/* Stats bar */}
                <div className="mb-20 grid grid-cols-2 gap-px bg-site-border sm:grid-cols-4">
                    {STATS.map((s) => (
                        <div key={s.label} className="bg-site-surface px-8 py-8 text-center">
                            <p className="text-4xl font-bold text-brand">{s.value}</p>
                            <p className="mt-1 text-sm text-site-muted">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Mixed dark / light card grid — inspired by Laravel.com testimonials */}
                <div className="grid gap-4 sm:grid-cols-3">

                    {/* Featured dark card — large, left column */}
                    <figure className="card-glow flex flex-col justify-between rounded-2xl bg-site-ink p-8 sm:row-span-2">
                        <blockquote className="text-base leading-relaxed text-zinc-300">
                            "{featured.quote}"
                        </blockquote>
                        <figcaption className="mt-8 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                                {featured.name[0]}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{featured.name}</p>
                                <p className="text-xs text-zinc-500">{featured.role}</p>
                            </div>
                        </figcaption>
                    </figure>

                    {/* Smaller white cards — right two columns */}
                    {rest.map((q) => (
                        <figure
                            key={q.name}
                            className="card-glow rounded-2xl border border-site-border bg-site-bg p-7"
                        >
                            <blockquote className="text-sm leading-relaxed text-site-muted">
                                "{q.quote}"
                            </blockquote>
                            <figcaption className="mt-6 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dim text-sm font-bold text-brand">
                                    {q.name[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-site-fg">{q.name}</p>
                                    <p className="text-xs text-site-muted">{q.role}</p>
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
