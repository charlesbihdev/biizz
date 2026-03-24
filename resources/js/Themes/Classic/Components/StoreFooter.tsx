import type { Business } from '@/types/business';

interface Props {
    business: Business;
}

export default function StoreFooter({ business }: Props) {
    const { name, description, address, social_links: social } = business;

    const whatsapp = social?.whatsapp;

    const socialLinks = [
        whatsapp          && { label: 'WhatsApp',  href: `https://wa.me/${whatsapp.replace(/\D/g, '')}`,                    color: 'text-green-600' },
        social?.instagram && { label: 'Instagram', href: `https://instagram.com/${social.instagram.replace(/^@/, '')}`,      color: 'text-pink-600' },
        social?.facebook  && { label: 'Facebook',  href: `https://facebook.com/${social.facebook}`,                          color: 'text-blue-600' },
        social?.tiktok    && { label: 'TikTok',    href: `https://tiktok.com/@${social.tiktok.replace(/^@/, '')}`,           color: 'text-zinc-800' },
        social?.twitter   && { label: 'Twitter',   href: `https://twitter.com/${social.twitter.replace(/^@/, '')}`,          color: 'text-sky-500' },
    ].filter(Boolean) as { label: string; href: string; color: string }[];

    return (
        <footer className="border-t border-zinc-200 bg-zinc-50 px-6 py-10">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <h3 className="font-bold text-zinc-900">{name}</h3>
                        {description && (
                            <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
                        )}
                    </div>

                    {(address || whatsapp) && (
                        <div>
                            <h4 className="text-sm font-semibold text-zinc-900">Contact</h4>
                            <ul className="mt-2 space-y-1 text-sm text-zinc-500">
                                {address && <li>{address}</li>}
                                {whatsapp && (
                                    <li>
                                        <a
                                            href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 hover:underline"
                                        >
                                            WhatsApp: {whatsapp}
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    {socialLinks.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-zinc-900">Follow us</h4>
                            <ul className="mt-2 space-y-1 text-sm">
                                {socialLinks.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`${link.color} hover:underline`}
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mt-8 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-400">
                    Powered by <span className="font-semibold text-zinc-600">biizz.app</span>
                </div>
            </div>
        </footer>
    );
}
