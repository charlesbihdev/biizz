import type { Business } from '@/types/business';

interface Props {
    business: Business;
}

export default function BoutiqueFooter({ business }: Props) {
    const { name, description, address, social_links: social } = business;

    const whatsapp = social?.whatsapp;

    const socialLinks = [
        whatsapp          && { label: 'WhatsApp',  href: `https://wa.me/${whatsapp.replace(/\D/g, '')}` },
        social?.instagram && { label: 'Instagram', href: `https://instagram.com/${social.instagram.replace(/^@/, '')}` },
        social?.facebook  && { label: 'Facebook',  href: `https://facebook.com/${social.facebook}` },
        social?.tiktok    && { label: 'TikTok',    href: `https://tiktok.com/@${social.tiktok.replace(/^@/, '')}` },
        social?.twitter   && { label: 'Twitter',   href: `https://twitter.com/${social.twitter.replace(/^@/, '')}` },
    ].filter(Boolean) as { label: string; href: string }[];

    return (
        <footer className="bg-zinc-950 px-6 py-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Brand */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">{name}</p>
                        {description && (
                            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{description}</p>
                        )}
                    </div>

                    {/* Contact */}
                    {(address || whatsapp) && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Contact</p>
                            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                                {address && <li>{address}</li>}
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

                    {/* Social */}
                    {socialLinks.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Follow</p>
                            <ul className="mt-3 space-y-2 text-sm">
                                {socialLinks.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-zinc-400 transition hover:text-white"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mt-12 border-t border-zinc-800 pt-8 text-center text-xs text-zinc-600">
                    Powered by <span className="font-semibold text-zinc-400">biizz.app</span>
                </div>
            </div>
        </footer>
    );
}
