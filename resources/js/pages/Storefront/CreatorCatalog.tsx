import { Link } from '@inertiajs/react';
import { product as marketplaceProduct } from '@/routes/marketplace';
import type { Business, Product } from '@/types';

type PaginatedProducts = {
    data:          Product[];
    current_page:  number;
    last_page:     number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

type Props = {
    business: Business;
    products: PaginatedProducts;
};

function CatalogCard({ business, product }: { business: Business; product: Product }) {
    const cover  = product.images[0]?.url;
    const isFree = parseFloat(product.price) === 0;
    const href   = marketplaceProduct({ business: business.slug, product: product.slug }).url;

    return (
        <Link
            href={href}
            className="group flex flex-col overflow-hidden rounded-2xl border border-site-border bg-white transition hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-site-surface">
                {cover ? (
                    <img
                        src={cover}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-site-muted">
                        <span className="text-xs">No cover</span>
                    </div>
                )}
                {product.digital_category && (
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                        {product.digital_category}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-site-fg transition group-hover:text-brand">
                    {product.name}
                </h3>

                <div className="mt-auto flex items-baseline gap-2">
                    {isFree ? (
                        <span className="text-sm font-bold text-brand">Free</span>
                    ) : (
                        <>
                            <span className="text-sm font-bold text-site-fg">
                                GHS {parseFloat(product.price).toFixed(2)}
                            </span>
                            {product.compare_at_price && (
                                <span className="text-xs text-site-muted line-through">
                                    GHS {parseFloat(product.compare_at_price).toFixed(2)}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default function CreatorCatalog({ business, products }: Props) {
    const initials = business.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

    return (
        <div className="min-h-screen bg-site-bg font-sans">
            {/* Header */}
            <header className="border-b border-site-border bg-white px-6 py-4">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    {business.logo_url ? (
                        <img src={business.logo_url} alt={business.name} className="h-8 object-contain" />
                    ) : (
                        <span className="text-base font-bold text-site-fg">{business.name}</span>
                    )}
                    <a
                        href="/"
                        className="text-xs text-site-muted transition hover:text-brand"
                    >
                        Powered by biizz
                    </a>
                </div>
            </header>

            {/* Creator hero */}
            <section className="border-b border-site-border bg-white px-6 py-10">
                <div className="mx-auto flex max-w-5xl items-center gap-6">
                    {business.logo_url ? (
                        <img
                            src={business.logo_url}
                            alt={business.name}
                            className="h-16 w-16 rounded-full object-cover ring-2 ring-site-border"
                        />
                    ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand/10 text-lg font-bold text-brand ring-2 ring-site-border">
                            {initials}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-site-fg">{business.name}</h1>
                        {business.tagline && (
                            <p className="mt-1 text-sm text-site-muted">{business.tagline}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Product grid */}
            <main className="mx-auto max-w-5xl px-6 py-10">
                {products.data.length === 0 ? (
                    <p className="py-20 text-center text-sm text-site-muted">No products listed yet.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {products.data.map((product) => (
                                <CatalogCard key={product.id} business={business} product={product} />
                            ))}
                        </div>

                        {(products.prev_page_url || products.next_page_url) && (
                            <div className="mt-10 flex justify-between">
                                <Link
                                    href={products.prev_page_url ?? '#'}
                                    className={`text-sm font-medium ${products.prev_page_url ? 'text-brand hover:underline' : 'pointer-events-none text-site-muted'}`}
                                >
                                    ← Previous
                                </Link>
                                <span className="text-sm text-site-muted">
                                    Page {products.current_page} of {products.last_page}
                                </span>
                                <Link
                                    href={products.next_page_url ?? '#'}
                                    className={`text-sm font-medium ${products.next_page_url ? 'text-brand hover:underline' : 'pointer-events-none text-site-muted'}`}
                                >
                                    Next →
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
