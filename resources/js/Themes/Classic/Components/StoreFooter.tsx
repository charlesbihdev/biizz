import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Twitter } from 'lucide-react';
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

// Split pages into two columns: policy-type vs others
function splitPages(pages: Page[]) {
    const policyTypes = new Set(['privacy_policy', 'terms', 'acceptable_use', 'shipping']);
    const policy  = pages.filter((p) => p.type && policyTypes.has(p.type));
    const others  = pages.filter((p) => !p.type || !policyTypes.has(p.type));
    return { policy, others };
}

interface Props {
    business: Business;
    pages:    Page[];
}

export default function StoreFooter({ business, pages }: Props) {
    const { name, description, address, contact_email, phone, social_links: social, slug, show_branding, theme_settings: s } = business;
    const primary = s?.primary_color ?? '#1a1a1a';
    const accent  = s?.accent_color  ?? primary;
    const bg      = s?.bg_color      ?? '#ffffff';
    const year   = new Date().getFullYear();

    const whatsapp     = social?.whatsapp;
    const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : null;

    const socialIcons = [
        social?.facebook  && { Icon: Facebook,        href: social.facebook.startsWith('http') ? social.facebook : `https://facebook.com/${social.facebook}`,       label: 'Facebook' },
        social?.instagram && { Icon: Instagram,       href: social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram.replace(/^@/, '')}`, label: 'Instagram' },
        social?.twitter   && { Icon: Twitter,         href: social.twitter.startsWith('http') ? social.twitter : `https://twitter.com/${social.twitter.replace(/^@/, '')}`,   label: 'X / Twitter' },
        whatsappHref      && { Icon: MessageCircle,   href: whatsappHref,                                                                                            label: 'WhatsApp' },
    ].filter(Boolean) as { Icon: React.ElementType; href: string; label: string }[];

    const { policy, others } = splitPages(pages);

    // Quick Links column always has Home + Shop + About Us (from pages if exists) + Contact
    const aboutPage = pages.find((p) => p.type === 'about');
    const faqPage   = pages.find((p) => p.type === 'faq');

    const hasPolicy  = policy.length > 0;
    const hasContact = !!(address || phone || contact_email || whatsappHref);

    const visibleCols = 2 + (hasPolicy ? 1 : 0) + (hasContact ? 1 : 0);
    const gridClass = {
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        3: 'grid-cols-1 sm:grid-cols-3',
        2: 'grid-cols-1 sm:grid-cols-2',
    }[visibleCols] ?? 'grid-cols-1';

    const linkColor  = primary + 'b3'; // 70% opacity — link text
    const bodyColor  = primary + '99'; // 60% opacity — description, address

    const footerLink = (href: string, label: ReactNode) => (
        <Link
            href={href}
            className="transition"
            style={{ color: linkColor }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = primary; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = linkColor; }}
        >
            {label}
        </Link>
    );

    const footerContactLink = (href: string, label: ReactNode) => (
        <a
            href={href}
            className="transition"
            style={{ color: linkColor }}
            onMouseEnter={(e) => { e.currentTarget.style.color = primary; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = linkColor; }}
        >
            {label}
        </a>
    );

    return (
        <footer className="border-t px-6 pt-14 pb-8" style={{ backgroundColor: bg, borderColor: primary + '1a' }}>
            <div className="mx-auto max-w-7xl">
                <div className={`grid gap-10 ${gridClass}`}>

                    {/* ── Col 1: Brand ── */}
                    <div>
                        {business.logo_url ? (
                            <img src={business.logo_url} alt={name} className="mb-4 h-14 w-auto object-contain" />
                        ) : (
                            <p className="mb-4 text-xl font-bold" style={{ color: primary }}>{name}</p>
                        )}
                        {description && (
                            <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>{description}</p>
                        )}
                        {socialIcons.length > 0 && (
                            <div className="mt-5 flex items-center gap-2">
                                {socialIcons.map(({ Icon, href, label }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="flex h-9 w-9 items-center justify-center rounded-full border transition"
                                        style={{ color: linkColor, borderColor: primary + '26' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = primary; e.currentTarget.style.borderColor = primary + '66'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = linkColor; e.currentTarget.style.borderColor = primary + '26'; }}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Col 2: Quick Links ── */}
                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: primary }}>
                            Quick Links
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>{footerLink(`/s/${slug}`, 'Home')}</li>
                            {business.theme_settings?.show_shop_page !== false && (
                                <li>{footerLink(`/s/${slug}/shop`, 'Shop')}</li>
                            )}
                            {aboutPage && (
                                <li>{footerLink(`/s/${slug}/pages/${aboutPage.slug}`, 'About Us')}</li>
                            )}
                            <li>{footerLink(`/s/${slug}/contact`, 'Contact')}</li>
                            {faqPage && (
                                <li>{footerLink(`/s/${slug}/pages/${faqPage.slug}`, 'FAQ')}</li>
                            )}
                            {others.filter((p) => p.type !== 'about' && p.type !== 'faq').map((page) => (
                                <li key={page.id}>{footerLink(`/s/${slug}/pages/${page.slug}`, pageLabel(page))}</li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Col 3: Policy & Terms ── */}
                    {hasPolicy && (
                        <div>
                            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: primary }}>
                                Policy &amp; Terms
                            </h4>
                            <ul className="space-y-3 text-sm">
                                {policy.map((page) => (
                                    <li key={page.id}>{footerLink(`/s/${slug}/pages/${page.slug}`, pageLabel(page))}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* ── Col 4: Contact Us ── */}
                    {hasContact && (
                        <div>
                            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: primary }}>
                                Contact Us
                            </h4>
                            <ul className="space-y-3 text-sm">
                                {address && (
                                    <li className="flex items-start gap-2.5">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
                                        <span className="leading-snug" style={{ color: bodyColor }}>{address}</span>
                                    </li>
                                )}
                                {phone && (
                                    <li className="flex items-center gap-2.5">
                                        <Phone className="h-4 w-4 shrink-0" style={{ color: accent }} />
                                        {footerContactLink(`tel:${phone}`, phone)}
                                    </li>
                                )}
                                {contact_email && (
                                    <li className="flex items-center gap-2.5">
                                        <Mail className="h-4 w-4 shrink-0" style={{ color: accent }} />
                                        {footerContactLink(`mailto:${contact_email}`, contact_email)}
                                    </li>
                                )}
                                {whatsappHref && (
                                    <li className="flex items-center gap-2.5">
                                        <MessageCircle className="h-4 w-4 shrink-0" style={{ color: accent }} />
                                        {footerContactLink(whatsappHref, whatsapp)}
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* ── Bottom bar ── */}
                <div className="mt-12 border-t pt-6 text-center text-xs" style={{ borderColor: primary + '1a', color: primary + '73' }}>
                    {show_branding !== false
                        ? <>Powered by <a href="https://biizz.app" className="font-semibold transition hover:underline" style={{ color: primary + 'b3' }}>biizz.app</a></>
                        : <>© {year} {name}. All rights reserved.</>
                    }
                </div>
            </div>
        </footer>
    );
}
