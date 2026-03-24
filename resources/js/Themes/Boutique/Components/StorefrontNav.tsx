import { useEffect, useState } from 'react';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import type { Business } from '@/types/business';

interface Props {
    business:   Business;
    itemCount:  number;
    onCartOpen: () => void;
}

export default function BoutiqueNav({ business, itemCount, onCartOpen }: Props) {
    const [scrolled, setScrolled] = useState(false);
    const { name, logo_url, social_links: social } = business;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const whatsapp = social?.whatsapp;
    const whatsappHref = whatsapp
        ? `https://wa.me/${whatsapp.replace(/\D/g, '')}`
        : null;

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-white shadow-sm' : 'bg-transparent'
            }`}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center px-6 lg:px-8">
                {/* WhatsApp — left */}
                <div className="flex-1 flex items-center">
                    {whatsappHref && (
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Chat on WhatsApp"
                            className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                                scrolled ? 'text-zinc-700 hover:text-green-600' : 'text-white/80 hover:text-white'
                            }`}
                        >
                            <MessageCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                    )}
                </div>

                {/* Logo — centered */}
                <a href="#" className="flex items-center">
                    {logo_url ? (
                        <img
                            src={logo_url}
                            alt={name}
                            className={`h-8 w-auto max-w-[140px] object-contain transition ${scrolled ? '' : 'brightness-0 invert'}`}
                        />
                    ) : (
                        <span
                            className={`text-sm font-bold uppercase tracking-[0.2em] transition ${
                                scrolled ? 'text-zinc-900' : 'text-white'
                            }`}
                        >
                            {name}
                        </span>
                    )}
                </a>

                {/* Cart — right */}
                <div className="flex-1 flex justify-end">
                    <button
                        onClick={onCartOpen}
                        aria-label="Open cart"
                        className={`relative flex items-center gap-1.5 text-xs font-semibold transition ${
                            scrolled ? 'text-zinc-700 hover:text-zinc-900' : 'text-white/80 hover:text-white'
                        }`}
                    >
                        <ShoppingBag className="h-5 w-5" />
                        {itemCount > 0 && (
                            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-zinc-900 leading-none">
                                {itemCount > 9 ? '9+' : itemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
