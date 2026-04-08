import { Link } from '@inertiajs/react';
import { BookOpen, Download, FileText, ExternalLink, Clock, ChevronRight } from 'lucide-react';
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

export default function PurchaseCard({ purchase }: { purchase: PurchaseWithProduct }) {
    const { product } = purchase;
    const cover = product.images[0]?.url;
    const hasFile = product.files.length > 0;
    const isEbook = EBOOK_CATEGORIES.includes((product.digital_category ?? '').toLowerCase());
    
    const statusConfig = {
        paid: { label: 'Paid', class: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        free: { label: 'Free', class: 'bg-blue-50 text-blue-700 border-blue-100' },
        pending: { label: 'Pending', class: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
    }[purchase.status as 'paid' | 'free' | 'pending'] || { label: purchase.status, class: 'bg-zinc-100 text-zinc-600 border-zinc-200' };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-site-border bg-white transition-all duration-300 hover:border-brand/30 hover:shadow-2xl hover:shadow-brand/5 focus-within:ring-2 focus-within:ring-brand">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-site-surface">
                {cover ? (
                    <img
                        src={cover}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-50">
                        <FileText className="h-10 w-10 text-zinc-200" />
                    </div>
                )}
                
                {/* Status Badge Over Image */}
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full border bg-white/90 px-2.5 py-1 text-[10px] font-black backdrop-blur-sm shadow-sm ring-1 ring-black/5">
                    <span className={cn("inline-block h-1.5 w-1.5 rounded-full", 
                        purchase.status === 'paid' ? 'bg-emerald-500' : 
                        purchase.status === 'free' ? 'bg-blue-500' : 'bg-amber-500'
                    )} />
                    {statusConfig.label}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-4 flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black tracking-widest text-brand uppercase">{product.digital_category || 'Digital'}</span>
                    </div>
                    <h3 className="line-clamp-1 text-base font-black text-site-fg transition-colors group-hover:text-brand">
                        {product.name}
                    </h3>
                    <p className="flex items-center gap-1 text-xs font-medium text-site-muted">
                        by <span className="font-bold text-site-fg/80">{product.business.name}</span>
                    </p>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between border-t border-zinc-50 pt-4">
                        <span className="text-[10px] font-bold text-site-muted uppercase">
                            Captured {new Date(purchase.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-sm font-black text-site-fg">
                            {purchase.status === 'free' ? 'Free' : `GHS ${parseFloat(purchase.amount_paid).toFixed(2)}`}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        {purchase.status !== 'pending' && hasFile ? (
                            <>
                                {isEbook ? (
                                    <Link
                                        href={libraryRead({ purchase: purchase.id }).url}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-xs font-black text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-hover hover:shadow-brand/30 active:scale-[0.98]"
                                    >
                                        <BookOpen className="h-3.5 w-3.5" />
                                        Start Reading
                                    </Link>
                                ) : (
                                    <a
                                        href={libraryShow({ purchase: purchase.id }).url}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3 text-xs font-black text-white transition-colors hover:bg-zinc-800 active:scale-[0.98]"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Download File
                                    </a>
                                )}
                            </>
                        ) : (
                            <button
                                disabled
                                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-site-border bg-site-surface py-3 text-xs font-bold text-site-muted opacity-60"
                            >
                                <Clock className="h-3.5 w-3.5" />
                                {purchase.status === 'pending' ? 'Verification Pending' : 'Processing Content'}
                            </button>
                        )}
                        
                        <Link
                           href={`/marketplace/${product.business.slug}/${product.slug}`} // TODO: Wayfinder for product detail if exists
                           className="flex h-11 w-11 items-center justify-center rounded-2xl border border-site-border bg-white text-site-muted transition-all hover:border-brand/40 hover:text-brand hover:shadow-sm"
                           title="Product Details"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
