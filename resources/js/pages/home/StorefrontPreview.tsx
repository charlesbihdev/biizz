// Supporting imagery — makes the abstract tangible.
// Shows a browser mockup of a live biizz storefront.

const MOCK_PRODUCTS = [
    { name: 'Ankara Tote Bag', price: 'GHS 85', color: 'bg-amber-100' },
    { name: 'Wax Print Scarf', price: 'GHS 40', color: 'bg-orange-100' },
    { name: 'Kente Clutch',    price: 'GHS 120', color: 'bg-yellow-100' },
    { name: 'Batik Sandals',   price: 'GHS 65',  color: 'bg-red-100' },
];

export default function StorefrontPreview() {
    return (
        <section className="bg-site-bg px-6 py-24">
            <div className="mx-auto max-w-5xl">

                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-brand">
                    Your store in minutes
                </p>
                <h2 className="mb-16 text-center text-3xl font-bold text-site-fg sm:text-4xl">
                    From WhatsApp to storefront — one platform.
                </h2>

                {/* Browser chrome mockup */}
                <div className="overflow-hidden rounded-2xl border border-site-border bg-site-surface shadow-2xl shadow-brand/5">

                    {/* Browser bar */}
                    <div className="flex items-center gap-3 border-b border-site-border bg-site-bg px-4 py-3">
                        <div className="flex gap-1.5">
                            <span className="h-3 w-3 rounded-full bg-zinc-700" />
                            <span className="h-3 w-3 rounded-full bg-zinc-700" />
                            <span className="h-3 w-3 rounded-full bg-zinc-700" />
                        </div>
                        <div className="flex flex-1 items-center justify-center">
                            <div className="flex h-6 items-center gap-2 rounded-md bg-zinc-800 px-3 text-xs text-zinc-500">
                                <span className="text-brand">⬤</span>
                                zaras-boutique.biizz.app
                            </div>
                        </div>
                    </div>

                    {/* Storefront content preview */}
                    <div className="bg-white p-0">
                        {/* Store hero */}
                        <div className="flex items-center justify-between bg-zinc-900 px-6 py-5">
                            <div>
                                <h3 className="font-bold text-white">Zara's Boutique</h3>
                                <p className="text-xs text-zinc-400">Premium African Fashion</p>
                            </div>
                            <button className="rounded-full bg-green-500 px-4 py-1.5 text-xs font-semibold text-white">
                                Chat on WhatsApp
                            </button>
                        </div>

                        {/* Product grid */}
                        <div className="grid grid-cols-4 gap-px bg-zinc-100">
                            {MOCK_PRODUCTS.map((p) => (
                                <div key={p.name} className="bg-white p-3">
                                    <div className={`mb-2 aspect-square rounded-lg ${p.color} flex items-center justify-center text-2xl`}>
                                        👜
                                    </div>
                                    <p className="text-xs font-medium text-zinc-900 line-clamp-1">{p.name}</p>
                                    <p className="text-xs font-bold text-zinc-900">{p.price}</p>
                                    <button className="mt-2 w-full rounded bg-zinc-900 py-1 text-[10px] font-semibold text-white">
                                        Add to cart
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Caption */}
                <p className="mt-6 text-center text-sm text-site-muted">
                    Every store gets its own URL, theme, payment setup, and AI agent — out of the box.
                </p>
            </div>
        </section>
    );
}
