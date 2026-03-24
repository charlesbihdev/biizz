const PLACEHOLDERS = [
    { quote: 'Absolutely stunning quality. My order arrived perfectly packaged and the fabric is incredible.', name: 'Abena K.', location: 'Accra, Ghana' },
    { quote: 'Fast delivery and the pieces look exactly like the photos. Will definitely be ordering again.', name: 'Tunde A.', location: 'Lagos, Nigeria' },
    { quote: 'Best online boutique in the region. The customer service is also top-notch.', name: 'Wanjiru M.', location: 'Nairobi, Kenya' },
];

export default function TestimonialRow() {
    return (
        <section className="bg-zinc-950 px-6 py-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                    What customers say
                </p>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
                    {PLACEHOLDERS.map((t) => (
                        <div
                            key={t.name}
                            className="min-w-[280px] max-w-xs shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                        >
                            <p className="text-sm leading-relaxed text-zinc-300">"{t.quote}"</p>
                            <div className="mt-4">
                                <p className="text-sm font-semibold text-white">{t.name}</p>
                                <p className="text-xs text-zinc-500">{t.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
