const PILLARS = [
    {
        icon: '🎨',
        label: 'The Look',
        headline: 'Pick a store design. Own your brand.',
        detail: 'Pick from store designs built by our expert designers. Set your colors, your layout, your identity. Change your look anytime without touching a single product or setting.',
    },
    {
        icon: '🤖',
        label: 'The AI Agent',
        headline: 'Your assistant that never sleeps.',
        detail: 'Your AI agent answers customer questions, suggests products based on what they are looking for, and collects payment directly in WhatsApp, even while you sleep. All you do is fulfill the order.',
    },
    {
        icon: '💳',
        label: 'The Money',
        headline: 'Connect your payment gateway. Get paid directly.',
        detail: 'Connect Paystack, Junipay, or your preferred payment gateway in minutes. Every payment goes straight into your own account, no middleman. More payment options are on the way.',
    },
    {
        icon: '📈',
        label: 'The Growth',
        headline: 'Meta Pixel built in. Run ads that find your buyers.',
        detail: 'Your store automatically communicates with Facebook and Instagram. When you run ads, they reach people most likely to buy from you, not just anyone. No code, no setup needed.',
    },
];

export default function PillarsSection() {
    return (
        <section id="features" className="bg-site-bg px-6 py-24">
            <div className="mx-auto max-w-5xl">
                <p className="mb-3 text-center text-xs font-semibold tracking-widest text-brand uppercase">
                    What's inside
                </p>
                <h2 className="mb-4 text-center text-3xl font-bold text-site-fg sm:text-4xl">
                    Everything a business needs. Nothing it doesn't.
                </h2>
                <p className="mx-auto mb-16 max-w-xl text-center text-site-muted">
                    Built for merchants who don't have time to stitch together
                    five different tools.
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
                                <span className="text-xs font-semibold tracking-widest text-brand uppercase">
                                    {p.label}
                                </span>
                            </div>
                            <h3 className="mb-2 text-lg leading-snug font-bold text-site-fg">
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
