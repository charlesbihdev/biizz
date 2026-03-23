const STATS = [
    { value: '200+', label: 'Early merchants' },
    { value: '4',    label: 'Countries' },
    { value: '< 5m', label: 'Store setup time' },
    { value: '0',    label: 'Plugins needed' },
];

const QUOTES = [
    {
        quote: 'I set up my store in an afternoon. My customers now order directly from WhatsApp and pay without me sending a single link manually.',
        name:  'Abena K.',
        role:  'Fashion retailer, Accra',
    },
    {
        quote: 'The Paystack integration alone saved me hours every week. Everything is in one place now.',
        name:  'Tunde A.',
        role:  'Electronics seller, Lagos',
    },
];

export default function SocialProofSection() {
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

                {/* Quotes */}
                <div className="grid gap-6 sm:grid-cols-2">
                    {QUOTES.map((q) => (
                        <figure
                            key={q.name}
                            className="card-glow rounded-2xl border border-site-border bg-site-bg p-7"
                        >
                            <blockquote className="text-sm leading-relaxed text-zinc-600">
                                "{q.quote}"
                            </blockquote>
                            <figcaption className="mt-5 flex items-center gap-3">
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
