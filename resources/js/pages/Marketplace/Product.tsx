import { Head, Link } from '@inertiajs/react';
import { index } from '@/routes/marketplace';
import { show as catalogShow } from '@/routes/catalog';
import CreatorInfo from '@/components/marketplace/CreatorInfo';
import MarketplaceFooter from '@/components/marketplace/MarketplaceFooter';
import MarketplaceNav from '@/components/marketplace/MarketplaceNav';
import PoweredByBadge from '@/components/marketplace/PoweredByBadge';
import ProductCard from '@/components/marketplace/ProductCard';
import ProductDescription from '@/components/marketplace/ProductDescription';
import ProductGallery from '@/components/marketplace/ProductGallery';
import PurchaseBox from '@/components/marketplace/PurchaseBox';
import type { Product } from '@/types';

type FullProduct = Product & {
    business: { id: number; name: string; slug: string; logo_url: string | null; description: string | null };
};

type RelatedProduct = Product & {
    business: { name: string; slug: string; logo_url: string | null };
};

interface Props {
    product: FullProduct;
    related: RelatedProduct[];
}

export default function MarketplaceProduct({ product, related }: Props) {
    const { business } = product;

    return (
        <>
            <Head title={`${product.name} — biizz.market`}>
                <meta name="description" content={product.description?.replace(/<[^>]+>/g, '').slice(0, 160) ?? ''} />
            </Head>

            <div className="min-h-screen bg-site-bg">
                <MarketplaceNav />

                <main className="mx-auto max-w-6xl px-5 pt-20 pb-12">
                    {/* Breadcrumb */}
                    <nav className="mb-6 flex items-center gap-2 text-xs text-site-muted">
                        <Link href={index().url} className="transition hover:text-site-fg">Marketplace</Link>
                        <span>/</span>
                        <Link href={catalogShow({ business: business.slug }).url} className="transition hover:text-site-fg">
                            {business.name}
                        </Link>
                        <span>/</span>
                        <span className="truncate text-site-fg">{product.name}</span>
                    </nav>

                    {/* Two-column layout */}
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
                        {/* Left: gallery + description */}
                        <div className="flex min-w-0 flex-1 flex-col gap-7">
                            <ProductGallery images={product.images} productName={product.name} />

                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">
                                    {product.category?.name ?? 'Digital'}
                                </p>
                                <h1 className="text-2xl font-bold leading-snug text-site-fg sm:text-3xl">
                                    {product.name}
                                </h1>
                                {product.tags.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {product.tags.map((tag) => (
                                            <span key={tag} className="rounded-full border border-site-border px-2.5 py-0.5 text-xs text-site-muted capitalize">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <ProductDescription description={product.description} tags={[]} />
                        </div>

                        {/* Right: purchase + creator (sticky on desktop) */}
                        <div className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-20 lg:w-80">
                            <PurchaseBox product={product} />
                            <CreatorInfo
                                name={business.name}
                                slug={business.slug}
                                logoUrl={business.logo_url}
                                description={business.description}
                            />
                        </div>
                    </div>

                    {/* Related products */}
                    {related.length > 0 && (
                        <section className="mt-14">
                            <h2 className="mb-5 text-lg font-bold text-site-fg">More from {business.name}</h2>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {related.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <MarketplaceFooter />
                <PoweredByBadge />
            </div>
        </>
    );
}
