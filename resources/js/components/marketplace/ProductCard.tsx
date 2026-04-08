import { Link } from '@inertiajs/react';
import { product as productRoute } from '@/routes/marketplace';
import type { Product } from '@/types';

type Props = {
    product: Product & {
        business: { name: string; slug: string; logo_url: string | null };
    };
};

export default function ProductCard({ product }: Props) {
    const cover = product.images[0]?.url;
    const href = productRoute({
        business: product.business.slug,
        product: product.slug,
    }).url;
    const isFree = parseFloat(product.price) === 0;
    const hasSale =
        !isFree &&
        !!product.compare_at_price &&
        parseFloat(product.compare_at_price) > parseFloat(product.price);
    const savings = hasSale
        ? Math.round(
              (1 -
                  parseFloat(product.price) /
                      parseFloat(product.compare_at_price!)) *
                  100,
          )
        : 0;

    return (
        <Link
            href={href}
            className="group flex flex-col overflow-hidden rounded-xl border border-site-border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-lg hover:shadow-black/5"
        >
            {/* Cover — fixed height, no stretching */}
            <div className="relative h-44 overflow-hidden bg-site-surface">
                {cover ? (
                    <img
                        src={cover}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-site-surface">
                        <span className="text-xs text-site-muted">
                            No cover
                        </span>
                    </div>
                )}

                {hasSale && (
                    <span className="absolute top-2 right-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        -{savings}%
                    </span>
                )}
                {isFree && (
                    <span className="absolute top-2 right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        Free
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-2 p-3.5">
                {/* Category + price */}
                <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-brand/30 bg-brand/5 px-2.5 py-0.5 text-[10px] font-semibold text-brand capitalize">
                        {product.digital_category ?? 'digital'}
                    </span>

                    <div className="flex shrink-0 items-center gap-1.5">
                        {isFree ? (
                            <span className="text-xs font-bold text-emerald-600">
                                Free
                            </span>
                        ) : (
                            <>
                                {hasSale && (
                                    <span className="text-[11px] text-site-muted line-through">
                                        GHS{' '}
                                        {parseFloat(
                                            product.compare_at_price!,
                                        ).toFixed(2)}
                                    </span>
                                )}
                                <span className="text-xs font-bold text-site-fg">
                                    GHS {parseFloat(product.price).toFixed(2)}
                                </span>
                                {hasSale && (
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                        Save {savings}%
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-site-fg transition-colors group-hover:text-brand">
                    {product.name}
                </h3>

                {/* Creator */}
                <p className="text-xs text-site-muted">
                    by {product.business.name}
                </p>

                {/* Tag pills */}
                {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-site-border bg-site-surface px-2 py-0.5 text-[10px] text-site-muted"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <span className="mt-auto pt-0.5 text-xs font-medium text-brand transition-all group-hover:underline group-hover:underline-offset-2">
                    View details →
                </span>
            </div>
        </Link>
    );
}
