import type { Business } from '@/types/business';

interface Props {
    business: Business;
}

export default function StoreFooter({ business }: Props) {
    const { theme_settings: s, name } = business;

    return (
        <footer className="border-t border-zinc-200 bg-zinc-50 px-6 py-10">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <h3 className="font-bold text-zinc-900">{name}</h3>
                        {s.store_description && (
                            <p className="mt-2 text-sm text-zinc-500">{s.store_description}</p>
                        )}
                    </div>
                    {(s.store_address || s.whatsapp_number) && (
                        <div>
                            <h4 className="text-sm font-semibold text-zinc-900">Contact</h4>
                            <ul className="mt-2 space-y-1 text-sm text-zinc-500">
                                {s.store_address && <li>{s.store_address}</li>}
                                {s.whatsapp_number && (
                                    <li>
                                        <a
                                            href={`https://wa.me/${s.whatsapp_number.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 hover:underline"
                                        >
                                            WhatsApp: {s.whatsapp_number}
                                        </a>
                                    </li>
                                )}
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
