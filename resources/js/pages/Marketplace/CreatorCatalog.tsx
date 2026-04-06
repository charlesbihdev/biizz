import { Head, Link } from '@inertiajs/react';
import MarketplaceFooter from '@/components/marketplace/MarketplaceFooter';
import MarketplaceNav from '@/components/marketplace/MarketplaceNav';
import { index, product as marketplaceProduct } from '@/routes/marketplace';
import type { Business, Product } from '@/types';

type PaginatedProducts = {
    data:          Product[];
    total:         number;
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
    const cover   = product.images[0]?.url;
    const isFree  = parseFloat(product.price) === 0;
    const hasSale = !isFree && product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price);
    const savings = hasSale
        ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compare_at_price!)) * 100)
        : 0;
    const href = marketplaceProduct({ business: business.slug, product: product.slug }).url;

    return (
        <Link href={href} className="group flex flex-col overflow-hidden rounded-2xl border border-site-border bg-white transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5">
            {/* Cover */}
            <div className="relative aspect-video overflow-hidden bg-site-surface">
                {cover ? (
                    <img
                        src={cover}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xs text-site-muted">No cover</span>
                    </div>
                )}
                {hasSale && (
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                        -{savings}%
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Category + price row */}
                <div className="flex items-center justify-between gap-2">
                    {product.digital_category && (
                        <span className="text-[11px] font-semibold text-brand uppercase tracking-wide">
                            {product.digital_category}
                        </span>
                    )}
                    <div className="ml-auto flex items-baseline gap-1.5 shrink-0">
                        {isFree ? (
                            <span className="text-sm font-bold text-brand">Free</span>
                        ) : (
                            <>
                                {product.compare_at_price && (
                                    <span className="text-xs text-site-muted line-through">
                                        GHS {parseFloat(product.compare_at_price).toFixed(2)}
                                    </span>
                                )}
                                <span className="text-sm font-bold text-site-fg">
                                    GHS {parseFloat(product.price).toFixed(2)}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-site-fg transition group-hover:text-brand">
                    {product.name}
                </h3>

                {/* Tags */}
                {product.tags.length > 0 && (
                    <p className="text-[11px] text-site-muted line-clamp-1">
                        {product.tags.slice(0, 4).join(' · ')}
                    </p>
                )}

                <span className="mt-auto text-xs font-medium text-brand group-hover:underline">
                    View details →
                </span>
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
        <>
            <Head title={`${business.name} — biizz.market`} />

            <div className="min-h-screen bg-site-bg">
                <MarketplaceNav />

                {/* Creator header */}
                <div className="pt-14">
                    <div className="mx-auto max-w-5xl px-5 py-10">
                        <Link
                            href={index().url}
                            className="mb-6 inline-flex items-center gap-1.5 text-xs text-site-muted transition hover:text-brand"
                        >
                            ← Back to marketplace
                        </Link>

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
                            {/* Avatar */}
                            {business.logo_url ? (
                                <img
                                    src={business.logo_url}
                                    alt={business.name}
                                    className="h-16 w-16 shrink-0 rounded-2xl border border-site-border object-cover"
                                />
                            ) : (
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-site-border bg-brand/10 text-lg font-bold text-brand">
                                    {initials}
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold text-site-fg">{business.name}</h1>
                                {business.tagline && (
                                    <p className="mt-1 text-sm text-site-muted">{business.tagline}</p>
                                )}
                                <p className="mt-2 text-xs text-site-muted">
                                    {products.total} {products.total === 1 ? 'product' : 'products'} available
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Thin divider */}
                    <div className="border-t border-site-border" />
                </div>

                {/* Products */}
                <main className="mx-auto max-w-5xl px-5 py-10">
                    {products.data.length === 0 ? (
                        <div className="py-24 text-center">
                            <p className="text-lg font-semibold text-site-fg">Nothing listed yet</p>
                            <p className="mt-1 text-sm text-site-muted">Check back soon.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {products.data.map((product) => (
                                    <CatalogCard key={product.id} business={business} product={product} />
                                ))}
                            </div>

                            {(products.prev_page_url || products.next_page_url) && (
                                <div className="mt-10 flex items-center justify-center gap-3">
                                    {products.prev_page_url ? (
                                        <Link href={products.prev_page_url} className="rounded-full border border-site-border px-5 py-2 text-xs font-medium text-site-muted transition hover:border-brand hover:text-brand">
                                            Previous
                                        </Link>
                                    ) : (
                                        <span className="rounded-full border border-site-border px-5 py-2 text-xs font-medium text-site-muted opacity-40">Previous</span>
                                    )}
                                    <span className="text-xs text-site-muted">Page {products.current_page} of {products.last_page}</span>
                                    {products.next_page_url ? (
                                        <Link href={products.next_page_url} className="rounded-full border border-site-border px-5 py-2 text-xs font-medium text-site-muted transition hover:border-brand hover:text-brand">
                                            Next
                                        </Link>
                                    ) : (
                                        <span className="rounded-full border border-site-border px-5 py-2 text-xs font-medium text-site-muted opacity-40">Next</span>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </main>

                <MarketplaceFooter />
            </div>
        </>
    );
}
