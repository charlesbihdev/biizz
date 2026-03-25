import type { Business, Page } from '@/types/business';

const PAGE_LABELS: Record<string, string> = {
    privacy_policy: 'Privacy Policy',
    faq:            'FAQ',
    terms:          'Terms & Conditions',
    about:          'About Us',
    shipping:       'Shipping & Returns',
    acceptable_use: 'Acceptable Use',
};

function pageLabel(page: Page): string {
    return page.type ? (PAGE_LABELS[page.type] ?? page.title) : page.title;
}

interface Props {
    business: Business;
    pages:    Page[];
}

export default function BoutiqueFooter({ business, pages }: Props) {
    const { name, description, address, contact_email, phone, social_links: social, slug, show_branding } = business;
    const year = new Date().getFullYear();

    const whatsapp = social?.whatsapp;

    const socialLinks = [
        whatsapp          && { label: 'WhatsApp', href: `https://wa.me/${whatsapp.replace(/\D/g, '')}` },
        social?.instagram && { label: 'Instagram', href: `https://instagram.com/${social.instagram.replace(/^@/, '')}` },
        social?.facebook  && { label: 'Facebook',  href: `https://facebook.com/${social.facebook}` },
        social?.tiktok    && { label: 'TikTok',    href: `https://tiktok.com/@${social.tiktok.replace(/^@/, '')}` },
        social?.twitter   && { label: 'Twitter',   href: `https://twitter.com/${social.twitter.replace(/^@/, '')}` },
    ].filter(Boolean) as { label: string; href: string }[];

    return (
        <footer className="bg-zinc-950 px-6 py-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div>
                        {business.logo_url ? (
                            <img src={business.logo_url} alt={name} className="mb-3 h-8 w-auto object-contain brightness-0 invert" />
                        ) : (
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">{name}</p>
                        )}
                        {description && (
                            <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
                        )}
                        {socialLinks.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-3">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-zinc-500 transition hover:text-white"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick links */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Shop</p>
                        <ul className="space-y-2 text-sm text-zinc-400">
                            <li><a href={`/s/${slug}`} className="transition hover:text-white">Home</a></li>
                            <li><a href={`/s/${slug}`} className="transition hover:text-white">All Products</a></li>
                            <li><a href={`/s/${slug}/contact`} className="transition hover:text-white">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Information */}
                    {pages.length > 0 && (
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Information</p>
                            <ul className="space-y-2 text-sm text-zinc-400">
                                {pages.map((page) => (
                                    <li key={page.id}>
                                        <a
                                            href={`/s/${slug}/pages/${page.slug}`}
                                            className="transition hover:text-white"
                                        >
                                            {pageLabel(page)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Contact */}
                    {(address || whatsapp || contact_email || phone) && (
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Contact</p>
                            <ul className="space-y-2 text-sm text-zinc-400">
                                {address && <li className="leading-snug">{address}</li>}
                                {phone && (
                                    <li>
                                        <a href={`tel:${phone}`} className="transition hover:text-white">{phone}</a>
                                    </li>
                                )}
                                {contact_email && (
                                    <li>
                                        <a href={`mailto:${contact_email}`} className="transition hover:text-white">{contact_email}</a>
                                    </li>
                                )}
                                {whatsapp && (
                                    <li>
                                        <a
                                            href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="transition hover:text-white"
                                        >
                                            {whatsapp}
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mt-12 border-t border-zinc-800 pt-8 text-center text-xs text-zinc-600">
                    {show_branding !== false
                        ? <>Powered by <span className="font-semibold text-zinc-400">biizz.app</span></>
                        : <>© {year} {name}. All rights reserved.</>
                    }
                </div>
            </div>
        </footer>
    );
}
