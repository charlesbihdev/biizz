import { Link } from '@inertiajs/react';
import { BookOpen, Download, Clock, FileText, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { show as libraryShow, read as libraryRead } from '@/routes/marketplace/library';
import type { MarketplacePurchase } from '@/types';

type PurchaseWithProduct = MarketplacePurchase & {
    product: {
        id: number;
        name: string;
        slug: string;
        digital_category: string | null;
        price: string;
        images: { url: string }[];
        business: { name: string; slug: string };
        files: { id: number }[];
    };
};

const EBOOK_CATEGORIES = ['ebooks', 'ebook'];

const STATUS_STYLES = {
    paid:    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    free:    'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
} as const;

export default function PurchaseHistoryList({ purchases }: { purchases: PurchaseWithProduct[] }) {
    if (purchases.length === 0) return null;

    return (
        <div className="overflow-hidden rounded-2xl border border-site-border bg-white shadow-sm">
            {/* Table header */}
            <div className="hidden grid-cols-[2fr_1fr_1fr_auto] items-center gap-4 border-b border-site-border bg-zinc-50/60 px-5 py-3 sm:grid">
                <span className="text-[10px] font-black tracking-widest text-site-muted uppercase">Product</span>
                <span className="text-[10px] font-black tracking-widest text-site-muted uppercase">Date</span>
                <span className="text-[10px] font-black tracking-widest text-site-muted uppercase">Amount</span>
                <span className="text-[10px] font-black tracking-widest text-site-muted uppercase">Action</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-site-border/60">
                {purchases.map((purchase) => {
                    const { product } = purchase;
                    const cover = product.images[0]?.url;
                    const isEbook = EBOOK_CATEGORIES.includes((product.digital_category ?? '').toLowerCase());
                    const hasFile = product.files.length > 0;
                    const statusStyle = STATUS_STYLES[purchase.status as keyof typeof STATUS_STYLES] ?? 'bg-zinc-100 text-zinc-600';
                    const amount =
                        purchase.status === 'free'
                            ? 'Free'
                            : `GHS ${parseFloat(purchase.amount_paid).toFixed(2)}`;
                    const date = new Date(purchase.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    });

                    return (
                        <div
                            key={purchase.id}
                            className="group grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-zinc-50/50 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-center sm:gap-4"
                        >
                            {/* Product info */}
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-site-border bg-zinc-50">
                                    {cover ? (
                                        <img src={cover} alt={product.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <FileText className="h-4 w-4 text-zinc-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-sm font-bold text-site-fg">{product.name}</p>
                                        <Link
                                            href={`/marketplace/${product.business.slug}/${product.slug}`}
                                            className="shrink-0 text-site-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-brand"
                                            title="View product"
                                        >
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-brand uppercase">
                                            {product.digital_category ?? 'Digital'}
                                        </span>
                                        <span className="text-[10px] text-site-muted">
                                            by {product.business.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Date */}
                            <p className="text-xs font-medium text-site-muted sm:text-left">
                                <span className="font-bold text-site-muted sm:hidden">Date: </span>
                                {date}
                            </p>

                            {/* Amount + status */}
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    'rounded-full px-2 py-0.5 text-[10px] font-black uppercase',
                                    statusStyle
                                )}>
                                    {purchase.status}
                                </span>
                                <span className="text-sm font-black text-site-fg">{amount}</span>
                            </div>

                            {/* Action */}
                            <div>
                                {purchase.status !== 'pending' && hasFile ? (
                                    isEbook ? (
                                        <Link
                                            href={libraryRead({ purchase: purchase.id }).url}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-[10px] font-black text-white shadow-sm shadow-brand/20 transition hover:bg-brand-hover"
                                        >
                                            <BookOpen className="h-3 w-3" />
                                            Read
                                        </Link>
                                    ) : (
                                        <a
                                            href={libraryShow({ purchase: purchase.id }).url}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-site-ink px-3.5 py-2 text-[10px] font-black text-white transition hover:opacity-85"
                                        >
                                            <Download className="h-3 w-3" />
                                            Download
                                        </a>
                                    )
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-site-border bg-zinc-50 px-3.5 py-2 text-[10px] font-bold text-site-muted">
                                        <Clock className="h-3 w-3" />
                                        Pending
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
