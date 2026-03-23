const PILLARS = [
    {
        icon: '🎨',
        label: 'The Look',
        headline: 'Themes built for your industry, not a generic template.',
        detail: 'Classic or Boutique — each theme is a full structural layout, not just a colour swap. Switch themes without touching your products or settings.',
    },
    {
        icon: '💳',
        label: 'The Money',
        headline: 'Paystack and Junipay, connected in 60 seconds.',
        detail: 'Paste your API key once. biizz encrypts it and handles every payment — card, bank transfer, mobile money — automatically.',
    },
    {
        icon: '🤖',
        label: 'The Brain',
        headline: 'An AI agent that sells for you while you sleep.',
        detail: 'Customers browse, ask questions, and confirm orders directly in WhatsApp. The agent generates the payment link. You just fulfil.',
    },
    {
        icon: '📈',
        label: 'The Growth',
        headline: 'Meta Pixel fires on every event, automatically.',
        detail: 'ViewContent, AddToCart, Purchase — tracked on every theme without a single line of code from you. Run ads, see ROI.',
    },
];

export default function PillarsSection() {
    return (
        <section id="features" className="bg-site-bg px-6 py-24">
            <div className="mx-auto max-w-5xl">

                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-brand">
                    What's inside
                </p>
                <h2 className="mb-4 text-center text-3xl font-bold text-site-fg sm:text-4xl">
                    Everything a business needs.{' '}
                    <span className="font-normal text-site-muted">Nothing it doesn't.</span>
                </h2>
                <p className="mx-auto mb-16 max-w-xl text-center text-site-muted">
                    Built for merchants who don't have time to stitch together five different tools.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                    {PILLARS.map((p) => (
                        <div
                            key={p.label}
                            className="card-glow rounded-2xl border border-site-border bg-site-surface p-7"
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dim text-xl">
                                    {p.icon}
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-widest text-brand">
                                    {p.label}
                                </span>
                            </div>
                            <h3 className="mb-2 text-lg font-bold leading-snug text-site-fg">
                                {p.headline}
                            </h3>
                            <p className="text-sm leading-relaxed text-site-muted">
                                {p.detail}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
