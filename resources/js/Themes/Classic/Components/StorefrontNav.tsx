import { useEffect, useState } from 'react';
import { MessageCircle, Search, ShoppingCart } from 'lucide-react';
import type { Business } from '@/types/business';

interface Props {
    business:    Business;
    itemCount:   number;
    onCartOpen:  () => void;
}

export default function StorefrontNav({ business, itemCount, onCartOpen }: Props) {
    const [scrolled, setScrolled] = useState(false);
    const { theme_settings: s, name } = business;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const whatsapp = business.social_links?.whatsapp;
    const whatsappHref = whatsapp
        ? `https://wa.me/${whatsapp.replace(/\D/g, '')}`
        : null;

    return (
        <header
            className={`sticky top-0 z-40 bg-white transition-shadow ${
                scrolled ? 'shadow-md' : 'border-b border-zinc-100'
            }`}
        >
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <a href="#" className="shrink-0 transition-opacity hover:opacity-80">
                    {business.logo_url ? (
                        <img src={business.logo_url} alt={name} className="h-8 w-auto max-w-[160px] object-contain" />
                    ) : (
                        <span className="text-base font-bold text-zinc-900">{name}</span>
                    )}
                </a>

                {/* Search bar (visual placeholder) */}
                <div className="hidden flex-1 sm:flex">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-400">
                        <Search className="h-4 w-4 shrink-0" />
                        <span>Search products…</span>
                    </div>
                </div>

                {/* Right actions */}
                <div className="ml-auto flex items-center gap-3">
                    {whatsappHref && (
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Chat on WhatsApp"
                            className="hidden items-center gap-1.5 rounded-full bg-green-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-green-600 sm:flex"
                        >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Chat
                        </a>
                    )}

                    <button
                        onClick={onCartOpen}
                        aria-label="Open cart"
                        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50"
                    >
                        <ShoppingCart className="h-4.5 w-4.5" />
                        {itemCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                                {itemCount > 9 ? '9+' : itemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
