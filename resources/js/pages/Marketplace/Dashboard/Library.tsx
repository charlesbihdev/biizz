import { Head, Link } from '@inertiajs/react';
import { BookOpen, Download, FileText } from 'lucide-react';
import BuyerDashboardLayout from '@/layouts/marketplace/buyer-dashboard-layout';
import { index as marketplaceIndex } from '@/routes/marketplace';
import { show as libraryShow, read as libraryRead } from '@/routes/marketplace/library';
import type { MarketplacePurchase, PaginatedData } from '@/types';

type BuyerStats = { purchase_count: number; total_spent: string };

type PurchaseWithProduct = MarketplacePurchase & {
    product: {
        id: number;
        name: string;
        slug: string;
        digital_category: string | null;
        price: string;
        compare_at_price: string | null;
        images: { url: string; alt?: string }[];
        business: { name: string; slug: string };
        files: { id: number }[];
    };
};

interface Props {
    purchases: PaginatedData<PurchaseWithProduct>;
    stats: BuyerStats;
}

const EBOOK_CATEGORIES = ['ebooks'];

function isEbook(category: string | null): boolean {
    return EBOOK_CATEGORIES.includes(category ?? '');
}

function PurchaseCard({ purchase }: { purchase: PurchaseWithProduct }) {
    const { product } = purchase;
    const cover = product.images[0]?.url;
    const hasFile = product.files.length > 0;
    const ebook = isEbook(product.digital_category);

    return (
        <div className="flex items-start gap-4 rounded-2xl border border-site-border bg-white p-4 transition hover:border-brand/20 hover:shadow-sm">
            <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-site-border bg-site-surface">
                {cover ? (
                    <img src={cover} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <FileText className="h-6 w-6 text-site-muted opacity-40" />
                    </div>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="truncate text-sm font-semibold text-site-fg">{product.name}</p>
                <p className="text-xs text-site-muted">by {product.business.name}</p>
                <div className="flex items-center gap-2">
                    {product.digital_category && (
                        <span className="rounded-full border border-brand/20 bg-brand/5 px-2 py-0.5 text-[10px] font-semibold text-brand capitalize">
                            {product.digital_category}
                        </span>
                    )}
                    <span className="text-xs text-site-muted">
                        {purchase.status === 'free' ? 'Free' : `GHS ${parseFloat(purchase.amount_paid).toFixed(2)}`}
                    </span>
                    <span className="text-xs text-site-muted">·</span>
                    <span className="text-xs text-site-muted">
                        {new Date(purchase.created_at).toLocaleDateString()}
                    </span>
                </div>

                {hasFile && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        {ebook ? (
                            <Link
                                href={libraryRead({ purchase: purchase.id }).url}
                                className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-hover"
                            >
                                <BookOpen className="h-3.5 w-3.5" />
                                Read
                            </Link>
                        ) : (
                            <a
                                href={libraryShow({ purchase: purchase.id }).url}
                                className="flex items-center gap-1.5 rounded-lg border border-site-border px-3 py-1.5 text-xs font-medium text-site-muted transition hover:border-brand hover:text-brand"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Download
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Library({ purchases, stats }: Props) {
    return (
        <BuyerDashboardLayout active="library" stats={stats}>
            <Head title="My Library — biizz.market" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-site-fg">My Library</h1>
                <p className="mt-0.5 text-sm text-site-muted">Your purchased and claimed digital products.</p>
            </div>

            {purchases.data.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-site-border bg-site-surface py-20 text-center">
                    <BookOpen className="h-10 w-10 text-site-muted opacity-30" />
                    <p className="text-base font-bold text-site-fg">Your library is empty</p>
                    <p className="text-sm text-site-muted">Browse the marketplace and grab your first product.</p>
                    <Link
                        href={marketplaceIndex().url}
                        className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover"
                    >
                        Browse Marketplace
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {purchases.data.map((p) => (
                            <PurchaseCard key={p.id} purchase={p} />
                        ))}
                    </div>

                    {purchases.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-3">
                            {purchases.prev_page_url && (
                                <Link href={purchases.prev_page_url} className="rounded-full border border-site-border px-5 py-2 text-xs font-medium text-site-muted transition hover:border-brand hover:text-brand">
                                    Previous
                                </Link>
                            )}
                            {purchases.next_page_url && (
                                <Link href={purchases.next_page_url} className="rounded-full border border-site-border px-5 py-2 text-xs font-medium text-site-muted transition hover:border-brand hover:text-brand">
                                    Next
                                </Link>
                            )}
                        </div>
                    )}
                </>
            )}
        </BuyerDashboardLayout>
    );
}
