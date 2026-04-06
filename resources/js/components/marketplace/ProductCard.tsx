import { Link } from '@inertiajs/react';
import type { Product } from '@/types';

type Props = {
    product: Product & { business: { name: string; slug: string; logo_url: string | null } };
};

export default function ProductCard({ product }: Props) {
    const cover   = product.images[0]?.url;
    const href    = `/marketplace/${product.business.slug}/${product.slug}`;
    const isFree  = parseFloat(product.price) === 0;
    const hasSale = !isFree && product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price);
    const savings = hasSale
        ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compare_at_price!)) * 100)
        : 0;

    return (
        <Link
            href={href}
            className="group flex flex-col overflow-hidden rounded-2xl border border-site-border bg-white transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5"
        >
            {/* Cover image — 16:9 fills the card width */}
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

            {/* Card body */}
            <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Category label + price */}
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                        {product.digital_category ?? 'Digital'}
                    </span>
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
                                {hasSale && (
                                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                        Save {savings}%
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-site-fg transition group-hover:text-brand">
                    {product.name}
                </h3>

                {/* Creator */}
                <p className="text-xs text-site-muted">by {product.business.name}</p>

                {/* Tags as bullet-separated text */}
                {product.tags.length > 0 && (
                    <p className="line-clamp-1 text-[11px] text-site-muted">
                        {product.tags.slice(0, 4).join(' · ')}
                    </p>
                )}

                <span className="mt-auto text-xs font-medium text-brand transition group-hover:underline">
                    View details →
                </span>
            </div>
        </Link>
    );
}
