import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Pencil, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { edit } from '@/routes/businesses/products';
import type { Business, Product } from '@/types';

interface Props {
    business: Business;
    product: Product | null;
    onClose: () => void;
}

function isHtml(str: string): boolean {
    return /<[a-z][\s\S]*>/i.test(str);
}

export function ProductDetailModal({ business, product, onClose }: Props) {
    const [activeImage, setActiveImage] = useState(0);

    if (!product) { return null; }

    const b     = { business: business.slug };
    const imgs  = product.images ?? [];
    const main  = imgs[activeImage]?.url ?? null;

    const stockLabel = product.stock === 0
        ? { text: 'Out of stock', cls: 'bg-red-100 text-red-700' }
        : product.stock <= 5
            ? { text: `Low stock (${product.stock})`, cls: 'bg-amber-100 text-amber-700' }
            : { text: `${product.stock} in stock`, cls: 'bg-green-100 text-green-700' };

    return (
        <Dialog open={!!product} onOpenChange={(open) => { if (!open) { onClose(); setActiveImage(0); } }}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="sr-only">Product details</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 pt-2 sm:grid-cols-2">
                    {/* Images */}
                    <div className="flex flex-col gap-2">
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-site-surface">
                            {main ? (
                                <img src={main} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-site-muted">
                                    <Package className="h-12 w-12 opacity-30" />
                                </div>
                            )}
                        </div>
                        {imgs.length > 1 && (
                            <div className="flex gap-1.5">
                                {imgs.map((img, i) => (
                                    <button
                                        key={img.url}
                                        type="button"
                                        onClick={() => setActiveImage(i)}
                                        className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                            i === activeImage ? 'border-brand' : 'border-transparent hover:border-site-border'
                                        }`}
                                    >
                                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-site-fg">{product.name}</h2>
                            {product.category && (
                                <span className="mt-1 inline-flex rounded-full bg-brand-dim px-2.5 py-0.5 text-xs font-medium text-brand">
                                    {product.category.name}
                                </span>
                            )}
                        </div>

                        <p className="text-2xl font-bold text-site-fg">
                            GHS {Number(product.price).toFixed(2)}
                        </p>

                        <div className="flex gap-2">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${stockLabel.cls}`}>
                                {stockLabel.text}
                            </span>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                product.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                            }`}>
                                {product.is_active ? 'Active' : 'Hidden'}
                            </span>
                        </div>

                        {product.description && (
                            <div className="border-t border-site-border pt-3">
                                {isHtml(product.description) ? (
                                    <div
                                        className="prose prose-sm max-w-none text-site-fg"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                ) : (
                                    <p className="text-sm leading-relaxed text-site-muted">{product.description}</p>
                                )}
                            </div>
                        )}

                        <div className="mt-auto pt-2">
                            <Link
                                href={edit({ ...b, product: product.id }).url}
                                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-hover"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit product
                            </Link>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
