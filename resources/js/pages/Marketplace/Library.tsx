import { Head, Link } from '@inertiajs/react';
import { Download, BookOpen } from 'lucide-react';
import { index } from '@/routes/marketplace';
import { show as libraryShow } from '@/routes/marketplace/library';
import MarketplaceFooter from '@/components/marketplace/MarketplaceFooter';
import MarketplaceNav from '@/components/marketplace/MarketplaceNav';
import type { MarketplacePurchase, PaginatedData } from '@/types';

type PurchaseWithProduct = MarketplacePurchase & {
    product: {
        id: number;
        name: string;
        slug: string;
        compare_at_price: string | null;
        price: string;
        images: { url: string; alt?: string }[];
        business: { name: string; slug: string };
    };
};

interface Props {
    purchases: PaginatedData<PurchaseWithProduct>;
}

function PurchaseCard({ purchase }: { purchase: PurchaseWithProduct }) {
    const { product } = purchase;
    const cover = product.images[0]?.url;

    return (
        <div className="flex items-start gap-4 rounded-2xl border border-site-border bg-site-surface p-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-site-border bg-site-bg">
                {cover ? (
                    <img src={cover} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-site-muted">
                        <BookOpen className="h-6 w-6 opacity-40" />
                    </div>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="truncate text-sm font-semibold text-site-fg">{product.name}</p>
                <p className="text-xs text-site-muted">by {product.business.name}</p>
                <p className="text-xs text-site-muted">
                    {purchase.status === 'free' ? 'Free' : `GHS ${parseFloat(purchase.amount_paid).toFixed(2)}`}
                    {' · '}
                    {new Date(purchase.created_at).toLocaleDateString()}
                </p>

                <div className="mt-2 flex items-center gap-2">
                    <a
                        href={libraryShow({ purchase: purchase.id }).url}
                        className="flex items-center gap-1.5 rounded-lg border border-site-border px-3 py-1.5 text-xs font-medium text-site-muted transition hover:border-brand hover:text-brand"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Download
                    </a>
                    <span className="flex items-center gap-1.5 rounded-lg border border-site-border px-3 py-1.5 text-xs font-medium text-site-muted opacity-50 cursor-default">
                        <BookOpen className="h-3.5 w-3.5" />
                        Read
                        <span className="rounded-sm bg-amber-100 px-1 py-0.5 text-[9px] font-semibold text-amber-700">soon</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function Library({ purchases }: Props) {
    return (
        <>
            <Head title="My Library — biizz.market" />

            <div className="min-h-screen bg-site-bg">
                <MarketplaceNav />

                <main className="mx-auto max-w-3xl px-5 pt-24 pb-16">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-site-fg">My Library</h1>
                        <p className="mt-1 text-sm text-site-muted">
                            Your purchased and claimed digital products.
                        </p>
                    </div>

                    {purchases.data.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 py-20 text-center">
                            <BookOpen className="h-10 w-10 text-site-muted opacity-40" />
                            <p className="text-lg font-bold text-site-fg">Your library is empty</p>
                            <p className="text-sm text-site-muted">Browse the marketplace and grab your first product.</p>
                            <Link
                                href={index().url}
                                className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover"
                            >
                                Browse Marketplace
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {purchases.data.map((p) => (
                                <PurchaseCard key={p.id} purchase={p} />
                            ))}

                            {purchases.last_page > 1 && (
                                <div className="mt-6 flex justify-center gap-3">
                                    {purchases.prev_page_url && (
                                        <Link href={purchases.prev_page_url} className="rounded-full border border-site-border px-5 py-2 text-xs font-medium text-site-muted transition hover:border-brand hover:text-brand">Previous</Link>
                                    )}
                                    {purchases.next_page_url && (
                                        <Link href={purchases.next_page_url} className="rounded-full border border-site-border px-5 py-2 text-xs font-medium text-site-muted transition hover:border-brand hover:text-brand">Next</Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </main>

                <MarketplaceFooter />
            </div>
        </>
    );
}
