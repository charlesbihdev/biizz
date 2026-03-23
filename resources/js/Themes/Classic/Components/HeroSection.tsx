import type { Business } from '@/types/business';

interface Props {
    business: Business;
}

export default function HeroSection({ business }: Props) {
    const { theme_settings: s, name } = business;

    return (
        <section
            className="relative flex min-h-[400px] items-center justify-center overflow-hidden bg-zinc-900"
            style={s.primary_color ? { backgroundColor: s.primary_color } : undefined}
        >
            {s.hero_image && (
                <img
                    src={s.hero_image}
                    alt={name}
                    className="absolute inset-0 h-full w-full object-cover opacity-40"
                />
            )}
            <div className="relative z-10 px-6 text-center text-white">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{name}</h1>
                {s.store_tagline && (
                    <p className="mt-4 text-lg text-white/80">{s.store_tagline}</p>
                )}
                {s.whatsapp_number && (
                    <a
                        href={`https://wa.me/${s.whatsapp_number?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600"
                    >
                        Chat on WhatsApp
                    </a>
                )}
            </div>
        </section>
    );
}
