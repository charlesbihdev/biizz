// Supporting imagery — makes the abstract tangible.
// Shows a browser mockup of a live biizz storefront.

const MOCK_PRODUCTS = [
    {
        name: 'Ankara Tote Bag',
        price: 'GHS 85',
        badge: 'Bestseller',
        img: '/assets/images/landing/black-bag.jfif',
    },
    {
        name: 'Wax Print Scarf',
        price: 'GHS 40',
        badge: null,
        img: '/assets/images/landing/print-scalf.jfif',
    },
    {
        name: 'Kente Clutch',
        price: 'GHS 120',
        badge: 'New',
        img: '/assets/images/landing/kente-clutch.jfif',
    },
    {
        name: 'Batik Sandals',
        price: 'GHS 65',
        badge: null,
        img: '/assets/images/landing/sandals.jfif',
    },
];

// Boutique's own palette — light, vibrant, completely separate from biizz brand
const STORE = {
    blue: '#2d5fa0', // muted steel blue
    blueDim: '#eff6ff', // very light blue tint for category strip
    gold: '#d97706', // warm gold — boutique accent
};

export default function StorefrontPreview() {
    return (
        <section className="bg-site-bg px-6 py-24">
            <div className="mx-auto max-w-5xl">
                <p className="mb-3 text-center text-xs font-semibold tracking-widest text-brand uppercase">
                    Your store in minutes
                </p>
                <h2 className="mb-16 text-center text-3xl font-bold text-site-fg sm:text-4xl">
                    Manage multiple online stores. One platform.
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
                                maya-boutique.biizz.app
                            </div>
                        </div>
                    </div>

                    {/* Store body */}
                    <div className="bg-white">
                        {/* Row 1 — Logo bar */}
                        <div className="flex items-center justify-between border-b border-zinc-100 bg-white px-3 py-2.5 sm:px-5 sm:py-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <img
                                    src="/assets/images/landing/mb-logo.png"
                                    alt="Maya's Boutique"
                                    className="h-7 w-7 rounded-lg object-cover sm:h-8 sm:w-8"
                                />
                                <div>
                                    <p className="text-xs leading-tight font-bold text-zinc-900 sm:text-sm">
                                        Maya's Boutique
                                    </p>
                                    <p className="text-[9px] text-zinc-400 sm:text-[10px]">
                                        Accra, Ghana
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 sm:gap-2">
                                <button className="hidden items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1 sm:flex">
                                    ♡ Saved
                                </button>
                                <button className="flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-1 sm:px-2.5">
                                    🛒 2
                                </button>
                                <button className="rounded-full bg-green-500 px-2.5 py-1 text-[9px] font-semibold text-white sm:px-3 sm:text-[10px]">
                                    WhatsApp
                                </button>
                            </div>
                        </div>

                        {/* Row 2 — Search bar */}
                        <div
                            className="flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-3"
                            style={{ background: STORE.blue }}
                        >
                            <div className="hidden items-center gap-1 rounded-l-full bg-white/15 px-3 py-2 text-[10px] whitespace-nowrap text-white/80 sm:flex">
                                All Categories{' '}
                                <span className="ml-1 text-white/50">▾</span>
                            </div>
                            <div className="flex flex-1 items-center rounded-full bg-white px-3 py-2 sm:rounded-l-none sm:rounded-r-full">
                                <span className="text-[10px] text-zinc-400 sm:text-xs">
                                    Search products, brands…
                                </span>
                            </div>
                            <button
                                className="rounded-full bg-white px-3 py-2 text-[9px] font-bold whitespace-nowrap sm:px-4 sm:text-[10px]"
                                style={{ color: STORE.blue }}
                            >
                                Search
                            </button>
                        </div>

                        {/* Row 3 — Department nav */}
                        <div
                            className="flex items-center overflow-x-auto border-b border-blue-100 text-[10px] font-medium"
                            style={{ background: STORE.blueDim }}
                        >
                            {[
                                "Women's Fashion",
                                "Men's Fashion",
                                'Bags',
                                'Footwear',
                                'Jewellery',
                                'Flash Sale 🔥',
                            ].map((cat, i) => (
                                <span
                                    key={cat}
                                    className="px-3 py-2 whitespace-nowrap text-zinc-500 hover:text-zinc-900 sm:px-4 sm:py-2.5"
                                    style={
                                        i === 0
                                            ? {
                                                  color: STORE.blue,
                                                  borderBottom: `2px solid ${STORE.blue}`,
                                                  fontWeight: 600,
                                              }
                                            : {}
                                    }
                                >
                                    {cat}
                                </span>
                            ))}
                        </div>

                        {/* Product grid — 2 cols mobile, 4 cols desktop */}
                        <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-3 sm:grid-cols-4 sm:gap-3 sm:p-4">
                            {MOCK_PRODUCTS.map((p) => (
                                <div
                                    key={p.name}
                                    className="group overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="relative overflow-hidden">
                                        {p.badge && (
                                            <span
                                                className="absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                                                style={{
                                                    background: STORE.blue,
                                                }}
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
                                    <div className="p-2 sm:p-3">
                                        <p className="line-clamp-1 text-[11px] font-semibold text-zinc-800">
                                            {p.name}
                                        </p>
                                        <div className="mt-1.5 flex items-center justify-between">
                                            <p className="text-[11px] font-bold text-zinc-900">
                                                {p.price}
                                            </p>
                                            <button
                                                className="rounded-md px-2 py-0.5 text-[9px] font-bold text-white"
                                                style={{
                                                    background: STORE.blue,
                                                }}
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
                    Every store gets its own Link, Brand, payment setup, and AI
                    agent — out of the box.
                </p>
            </div>
        </section>
    );
}
