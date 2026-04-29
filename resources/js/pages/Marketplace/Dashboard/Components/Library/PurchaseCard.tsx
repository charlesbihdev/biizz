import { Link } from '@inertiajs/react';
import { BookOpen, Download, FileText, Clock, ArrowUpRight } from 'lucide-react';
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

const STATUS = {
    paid:    { label: 'Paid',    dot: 'bg-emerald-500' },
    free:    { label: 'Free',    dot: 'bg-blue-500' },
    pending: { label: 'Pending', dot: 'bg-amber-500' },
} as const;

export default function PurchaseCard({ purchase }: { purchase: PurchaseWithProduct }) {
    const { product } = purchase;
    const cover = product.images[0]?.url;
    const hasFile = product.files.length > 0;
    const isEbook = EBOOK_CATEGORIES.includes((product.digital_category ?? '').toLowerCase());
    const status = STATUS[purchase.status as keyof typeof STATUS] ?? { label: purchase.status, dot: 'bg-zinc-400' };

    const amount =
        purchase.status === 'free'
            ? 'Free'
            : `GHS ${parseFloat(purchase.amount_paid).toFixed(2)}`;

    return (
        <div className="group flex flex-col overflow-hidden rounded-2xl border border-site-border bg-white transition-all duration-300 hover:border-brand/25 hover:shadow-xl hover:shadow-brand/6">
            {/* Cover */}
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-50">
                {cover ? (
                    <img
                        src={cover}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <FileText className="h-10 w-10 text-zinc-200" />
                    </div>
                )}

                {/* Status pill */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-black/6 bg-white/95 px-2.5 py-1 shadow-sm backdrop-blur-sm">
                    <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                    <span className="text-[10px] font-black text-site-fg">{status.label}</span>
                </div>

                {/* Details link */}
                <Link
                    href={`/marketplace/${product.business.slug}/${product.slug}`}
                    className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border border-black/6 bg-white/95 text-site-muted opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:text-brand"
                    title="View product"
                >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col p-4">
                <div className="mb-3">
                    <span className="text-[10px] font-black tracking-widest text-brand uppercase">
                        {product.digital_category ?? 'Digital'}
                    </span>
                    <h3 className="mt-0.5 line-clamp-1 text-sm font-black text-site-fg group-hover:text-brand transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-xs font-medium text-site-muted">
                        by <span className="font-semibold text-site-fg/70">{product.business.name}</span>
                    </p>
                </div>

                <div className="mt-auto">
                    <div className="mb-3 flex items-center justify-between border-t border-zinc-50 pt-3">
                        <span className="text-[10px] font-medium text-site-muted">
                            {new Date(purchase.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </span>
                        <span className={cn(
                            'text-sm font-black',
                            purchase.status === 'free' ? 'text-blue-600' : 'text-site-fg'
                        )}>
                            {amount}
                        </span>
                    </div>

                    {/* CTA */}
                    {purchase.status !== 'pending' && hasFile ? (
                        isEbook ? (
                            <Link
                                href={libraryRead({ purchase: purchase.id }).url}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-xs font-black text-white shadow-md shadow-brand/20 transition-all hover:bg-brand-hover active:scale-[0.98]"
                            >
                                <BookOpen className="h-3.5 w-3.5" />
                                Start Reading
                            </Link>
                        ) : (
                            <a
                                href={libraryShow({ purchase: purchase.id }).url}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-site-ink py-2.5 text-xs font-black text-white transition-colors hover:opacity-90 active:scale-[0.98]"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Download File
                            </a>
                        )
                    ) : (
                        <button
                            disabled
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-site-border bg-site-surface py-2.5 text-xs font-bold text-site-muted opacity-60"
                        >
                            <Clock className="h-3.5 w-3.5" />
                            {purchase.status === 'pending' ? 'Verification Pending' : 'Processing Content'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
