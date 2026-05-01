import { Link } from '@inertiajs/react';
import { ExternalLink, Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteProductDialog } from '@/components/admin/products/DeleteProductDialog';
import { edit } from '@/routes/businesses/products';
import { product as marketplaceProduct } from '@/routes/marketplace';
import type { Business, Product } from '@/types';

// Mirrors ProductController::LOW_STOCK_MAX (PHP-side source of truth).
const LOW_STOCK_THRESHOLD = 5;

type Props = {
    business: Business;
    product: Product;
    rowNumber: number;
    onView: (product: Product) => void;
};

function StockCell({ stock }: { stock: number }) {
    if (stock < 0) {
        return (
            <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                {stock} oversold
            </span>
        );
    }

    if (stock === 0) {
        return (
            <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                Out of stock
            </span>
        );
    }

    if (stock <= LOW_STOCK_THRESHOLD) {
        return (
            <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {stock} left
            </span>
        );
    }

    return <span className="text-sm text-site-muted">{stock}</span>;
}

export function ProductRow({ business, product, rowNumber, onView }: Props) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const b = { business: business.slug };

    return (
        <>
            <tr className="border-b border-site-border last:border-0 hover:bg-site-surface/50">
                <td className="py-3 pl-4 pr-3 text-xs tabular-nums text-site-muted">{rowNumber}</td>
                <td className="py-3 pl-4 pr-3">
                    <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                            <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="h-9 w-9 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="h-9 w-9 rounded-lg bg-site-surface" />
                        )}
                        <div>
                            <span className="text-sm font-medium text-site-fg">{product.name}</span>
                            {product.category && (
                                <span className="ml-2 inline-flex rounded-full bg-brand-dim px-2 py-0.5 text-[11px] font-medium text-brand">
                                    {product.category.name}
                                </span>
                            )}
                        </div>
                    </div>
                </td>
                <td className="px-3 py-3 text-sm text-site-fg">
                    GHS {Number(product.price).toFixed(2)}
                </td>
                <td className="px-3 py-3">
                    {business.business_type === 'digital' ? (
                        <span className="text-sm text-site-muted">Unlimited</span>
                    ) : (
                        <StockCell stock={product.stock} />
                    )}
                </td>
                <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        product.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-neutral-100 text-neutral-500'
                    }`}>
                        {product.is_active ? 'Active' : 'Hidden'}
                    </span>
                </td>
                <td className="py-3 pl-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => onView(product)}
                            className="rounded-lg p-1.5 text-site-muted transition hover:bg-site-surface hover:text-site-fg"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                        {business.business_type === 'digital' && (
                            <a
                                href={marketplaceProduct({ business: business.slug, product: product.slug }).url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg p-1.5 text-site-muted transition hover:bg-site-surface hover:text-site-fg"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        )}
                        <Link
                            href={edit({ ...b, product: product.slug }).url}
                            className="rounded-lg p-1.5 text-site-muted transition hover:bg-site-surface hover:text-site-fg"
                        >
                            <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                            type="button"
                            onClick={() => setDeleteOpen(true)}
                            className="rounded-lg p-1.5 text-site-muted transition hover:bg-red-50 hover:text-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </td>
            </tr>

            <DeleteProductDialog
                business={business}
                product={product}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </>
    );
}
