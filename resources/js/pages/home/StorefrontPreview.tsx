// Supporting imagery — makes the abstract tangible.
// Shows a browser mockup of a live biizz storefront.

const MOCK_PRODUCTS = [
    { name: 'Ankara Tote Bag',  price: 'GHS 85',  badge: 'Bestseller', swatch: 'bg-amber-200' },
    { name: 'Wax Print Scarf',  price: 'GHS 40',  badge: null,         swatch: 'bg-orange-200' },
    { name: 'Kente Clutch',     price: 'GHS 120', badge: 'New',        swatch: 'bg-yellow-200' },
    { name: 'Batik Sandals',    price: 'GHS 65',  badge: null,         swatch: 'bg-red-100' },
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
                <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-xl shadow-black/8">

                    {/* Browser bar */}
                    <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
                        <div className="flex gap-1.5">
                            <span className="h-3 w-3 rounded-full bg-zinc-300" />
                            <span className="h-3 w-3 rounded-full bg-zinc-300" />
                            <span className="h-3 w-3 rounded-full bg-zinc-300" />
                        </div>
                        <div className="flex flex-1 items-center justify-center">
                            <div className="flex h-6 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-400">
                                <span className="h-2 w-2 rounded-full bg-green-400" />
                                zaras-boutique.biizz.app
                            </div>
                        </div>
                    </div>

                    {/* Storefront content */}
                    <div className="bg-white">

                        {/* Store header */}
                        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-900 px-6 py-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                                    Accra · Est. 2021
                                </p>
                                <h3 className="text-base font-bold text-white">Zara's Boutique</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                                    🔍 Search
                                </button>
                                <button className="rounded-full bg-green-500 px-3 py-1.5 text-xs font-semibold text-white">
                                    WhatsApp
                                </button>
                            </div>
                        </div>

                        {/* Category strip */}
                        <div className="flex gap-4 overflow-x-auto border-b border-zinc-100 bg-white px-6 py-3 text-xs">
                            {['All', 'Bags', 'Scarves', 'Footwear', 'Jewellery'].map((c, i) => (
                                <span
                                    key={c}
                                    className={`whitespace-nowrap font-medium ${i === 0 ? 'text-zinc-900 underline underline-offset-4 decoration-brand' : 'text-zinc-400'}`}
                                >
                                    {c}
                                </span>
                            ))}
                        </div>

                        {/* Product grid — no gap-px, real store spacing */}
                        <div className="grid grid-cols-4 gap-4 bg-white p-4">
                            {MOCK_PRODUCTS.map((p) => (
                                <div key={p.name} className="group relative overflow-hidden rounded-xl border border-zinc-100 bg-white">
                                    {p.badge && (
                                        <span className="absolute left-2 top-2 z-10 rounded-full bg-zinc-900 px-2 py-0.5 text-[9px] font-semibold text-white">
                                            {p.badge}
                                        </span>
                                    )}
                                    <div className={`aspect-square ${p.swatch} flex items-center justify-center text-3xl`}>
                                        👜
                                    </div>
                                    <div className="p-3">
                                        <p className="text-[11px] font-semibold text-zinc-800 line-clamp-1">{p.name}</p>
                                        <div className="mt-1.5 flex items-center justify-between">
                                            <p className="text-[11px] font-bold text-zinc-900">{p.price}</p>
                                            <button className="rounded-md bg-zinc-900 px-2 py-0.5 text-[9px] font-semibold text-white">
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="mt-6 text-center text-sm text-site-muted">
                    Every store gets its own URL, theme, payment setup, and AI agent — out of the box.
                </p>
            </div>
        </section>
    );
}
