import { Link } from '@inertiajs/react';
import { Facebook, Instagram, MessageCircle, Twitter } from 'lucide-react';
import { show, contact, page as pageRoute } from '@/routes/storefront';
import type { Business, Page } from '@/types/business';

interface Props {
    business: Business;
    pages:    Page[];
}

export default function FunnelFooter({ business, pages }: Props) {
    const { name, social_links: social, show_branding } = business;
    const year = new Date().getFullYear();
    const b    = { business: business.slug };

    const whatsapp     = social?.whatsapp;
    const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : null;

    const socialLinks = [
        social?.instagram && {
            Icon:  Instagram,
            href:  social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram.replace(/^@/, '')}`,
            label: 'Instagram',
        },
        social?.facebook && {
            Icon:  Facebook,
            href:  social.facebook.startsWith('http') ? social.facebook : `https://facebook.com/${social.facebook}`,
            label: 'Facebook',
        },
        social?.twitter && {
            Icon:  Twitter,
            href:  social.twitter.startsWith('http') ? social.twitter : `https://twitter.com/${social.twitter.replace(/^@/, '')}`,
            label: 'X',
        },
        whatsappHref && {
            Icon:  MessageCircle,
            href:  whatsappHref,
            label: 'WhatsApp',
        },
    ].filter(Boolean) as { Icon: React.ElementType; href: string; label: string }[];

    const publishedPages = pages.filter((p) => p.is_published);
    const aboutPage      = publishedPages.find((p) => p.type === 'about');
    const faqPage        = publishedPages.find((p) => p.type === 'faq');
    const policyPages    = publishedPages.filter((p) =>
        p.type === 'privacy_policy' || p.type === 'terms' || p.type === 'acceptable_use' || p.type === 'shipping',
    );

    const navLinks = [
        { href: show(b).url, label: 'Home' },
        { href: contact(b).url, label: 'Contact' },
        ...(aboutPage ? [{ href: pageRoute({ business: business.slug, page: aboutPage.slug }).url, label: 'About' }] : []),
        ...(faqPage   ? [{ href: pageRoute({ business: business.slug, page: faqPage.slug   }).url, label: 'FAQ'   }] : []),
        ...policyPages.map((p) => ({ href: pageRoute({ business: business.slug, page: p.slug }).url, label: p.title })),
    ];

    return (
        <footer className="border-t border-zinc-100 bg-white px-6 py-10">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">

                    {/* Brand */}
                    <div className="shrink-0">
                        {business.logo_url ? (
                            <img src={business.logo_url} alt={name} className="h-7 w-auto object-contain" />
                        ) : (
                            <span className="text-sm font-bold text-zinc-900">{name}</span>
                        )}
                    </div>

                    {/* Links */}
                    {navLinks.length > 0 && (
                        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                            {navLinks.map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="text-sm text-zinc-500 transition hover:text-zinc-900"
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* Social */}
                    {socialLinks.length > 0 && (
                        <div className="flex items-center gap-2">
                            {socialLinks.map(({ Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition hover:border-zinc-400 hover:text-zinc-700"
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 border-t border-zinc-100 pt-6 text-center text-xs text-zinc-400">
                    {show_branding !== false ? (
                        <>
                            Powered by{' '}
                            <a
                                href="https://biizz.app"
                                className="font-medium text-zinc-500 transition hover:text-zinc-700"
                            >
                                biizz.app
                            </a>
                        </>
                    ) : (
                        <>{year} {name}. All rights reserved.</>
                    )}
                </div>
            </div>
        </footer>
    );
}
