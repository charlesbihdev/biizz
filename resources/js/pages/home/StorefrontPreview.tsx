// Supporting imagery — makes the abstract tangible.
// Shows a browser mockup of a live biizz storefront.

const MOCK_PRODUCTS = [
    {
        name:  'Ankara Tote Bag',
        price: 'GHS 85',
        badge: 'Bestseller',
        img:   'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&q=80',
    },
    {
        name:  'Wax Print Scarf',
        price: 'GHS 40',
        badge: null,
        img:   'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop&q=80',
    },
    {
        name:  'Kente Clutch',
        price: 'GHS 120',
        badge: 'New',
        img:   'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=400&fit=crop&q=80',
    },
    {
        name:  'Batik Sandals',
        price: 'GHS 65',
        badge: null,
        img:   'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop&q=80',
    },
];

// Boutique's own palette — light, vibrant, completely separate from biizz brand
const STORE = {
    blue:    '#2d5fa0',   // muted steel blue
    blueDim: '#eff6ff',   // very light blue tint for category strip
    gold:    '#d97706',   // warm gold — boutique accent
};

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

                {/* Browser chrome */}
                <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-2xl shadow-black/10">

                    {/* Browser bar — macOS traffic light dots */}
                    <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
                        <div className="flex gap-1.5">
                            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                        </div>
                        <div className="flex flex-1 items-center justify-center">
                            <div className="flex h-6 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-400">
                                <span className="h-2 w-2 rounded-full bg-green-400" />
                                zaras-boutique.biizz.app
                            </div>
                        </div>
                    </div>

                    {/* Store body */}
                    <div className="bg-white">

                        {/* Row 1 — Logo bar — white */}
                        <div className="flex items-center justify-between border-b border-zinc-100 bg-white px-5 py-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white"
                                    style={{ background: STORE.blue }}
                                >
                                    ZB
                                </div>
                                <div>
                                    <p className="text-sm font-bold leading-tight text-zinc-900">Zara's Boutique</p>
                                    <p className="text-[10px] text-zinc-400">Accra, Ghana</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <button className="flex items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1">
                                    ♡ Saved
                                </button>
                                <button className="flex items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1">
                                    🛒 2
                                </button>
                                <button className="rounded-full bg-green-500 px-3 py-1 text-[10px] font-semibold text-white">
                                    WhatsApp
                                </button>
                            </div>
                        </div>

                        {/* Row 2 — Jumia-style search bar — electric blue */}
                        <div
                            className="flex items-center gap-2 px-5 py-3"
                            style={{ background: STORE.blue }}
                        >
                            <div className="flex items-center gap-1 rounded-l-full bg-white/15 px-3 py-2 text-[10px] text-white/80 whitespace-nowrap">
                                All Categories <span className="ml-1 text-white/50">▾</span>
                            </div>
                            <div className="flex flex-1 items-center rounded-r-full bg-white px-3 py-2">
                                <span className="text-zinc-400 text-xs">Search products, brands…</span>
                            </div>
                            <button
                                className="rounded-full bg-white px-4 py-2 text-[10px] font-bold whitespace-nowrap"
                                style={{ color: STORE.blue }}
                            >
                                Search
                            </button>
                        </div>

                        {/* Row 3 — Department nav — light blue tint, dark text */}
                        <div
                            className="flex items-center overflow-x-auto border-b border-blue-100 text-[10px] font-medium"
                            style={{ background: STORE.blueDim }}
                        >
                            {["Women's Fashion", "Men's Fashion", "Bags", "Footwear", "Jewellery", "Flash Sale 🔥"].map((cat, i) => (
                                <span
                                    key={cat}
                                    className="whitespace-nowrap px-4 py-2.5 text-zinc-500 hover:text-zinc-900"
                                    style={i === 0 ? { color: STORE.blue, borderBottom: `2px solid ${STORE.blue}`, fontWeight: 600 } : {}}
                                >
                                    {cat}
                                </span>
                            ))}
                        </div>

                        {/* Product grid */}
                        <div className="grid grid-cols-4 gap-3 bg-zinc-50 p-4">
                            {MOCK_PRODUCTS.map((p) => (
                                <div
                                    key={p.name}
                                    className="group overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="relative overflow-hidden">
                                        {p.badge && (
                                            <span
                                                className="absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                                                style={{ background: STORE.blue }}
                                            >
                                                {p.badge}
                                            </span>
                                        )}
                                        <img
                                            src={p.img}
                                            alt={p.name}
                                            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <p className="line-clamp-1 text-[11px] font-semibold text-zinc-800">{p.name}</p>
                                        <div className="mt-1.5 flex items-center justify-between">
                                            <p className="text-[11px] font-bold text-zinc-900">{p.price}</p>
                                            <button
                                                className="rounded-md px-2 py-0.5 text-[9px] font-bold text-white"
                                                style={{ background: STORE.blue }}
                                            >
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
