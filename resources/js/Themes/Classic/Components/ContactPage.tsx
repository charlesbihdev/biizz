import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import ClassicThemeShell from '../ThemeShell';
import type { Business, Page } from '@/types/business';

interface Props {
    business: Business;
    pages:    Page[];
}

function ContactContent({ business }: { business: Business }) {
    const { name, contact_email, phone, address, social_links: social, theme_settings: s } = business;
    const primary    = s.primary_color ?? '#1a1a1a';
    const accent     = s.accent_color  ?? primary;
    const textLabel  = primary + '73';
    const textValue  = primary + 'cc';

    const whatsapp = social?.whatsapp;
    const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : null;

    const contactCard = (
        href: string | undefined,
        icon: ReactNode,
        label: string,
        value: ReactNode,
        extraProps?: AnchorHTMLAttributes<HTMLAnchorElement>,
    ) => {
        const inner = (
            <>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: accent + '18' }}>
                    {icon}
                </span>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: textLabel }}>{label}</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: textValue }}>{value}</p>
                </div>
            </>
        );

        if (href) {
            return (
                <a href={href} className="flex items-start gap-4 rounded-2xl border p-5 transition hover:shadow-sm" style={{ borderColor: primary + '1a' }} {...extraProps}>
                    {inner}
                </a>
            );
        }

        return (
            <div className="flex items-start gap-4 rounded-2xl border p-5" style={{ borderColor: primary + '1a' }}>
                {inner}
            </div>
        );
    };

    return (
        <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
            <h1 className="mb-2 text-3xl font-bold" style={{ color: primary }}>Contact {name}</h1>
            <p className="mb-10 text-sm" style={{ color: primary + 'b3' }}>Reach out to us — we'd love to hear from you.</p>

            <div className="grid gap-4 sm:grid-cols-2">
                {contact_email && contactCard(
                    `mailto:${contact_email}`,
                    <Mail className="h-5 w-5" style={{ color: accent }} />,
                    'Email',
                    contact_email,
                )}

                {phone && contactCard(
                    `tel:${phone}`,
                    <Phone className="h-5 w-5" style={{ color: accent }} />,
                    'Phone',
                    phone,
                )}

                {whatsappHref && contactCard(
                    whatsappHref,
                    <MessageCircle className="h-5 w-5" style={{ color: accent }} />,
                    'WhatsApp',
                    whatsapp,
                    { target: '_blank', rel: 'noopener noreferrer' },
                )}

                {address && contactCard(
                    undefined,
                    <MapPin className="h-5 w-5" style={{ color: accent }} />,
                    'Address',
                    <span className="whitespace-pre-line">{address}</span>,
                )}
            </div>
        </main>
    );
}

export default function ContactPage({ business, pages }: Props) {
    return (
        <ClassicThemeShell business={business} pages={pages}>
            <ContactContent business={business} />
        </ClassicThemeShell>
    );
}
