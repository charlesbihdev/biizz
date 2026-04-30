import type { Business } from '@/types/business';

interface Props {
    business: Business;
}

type ClassicHeroSettings = {
    primary_color?: string;
    accent_color?: string;
    hero_image?: string;
    store_tagline?: string;
};

export default function HeroSection({ business }: Props) {
    const { name } = business;
    const s = business.theme_settings as ClassicHeroSettings;
    const primary = s.primary_color ?? '#18181b';
    const accent  = s.accent_color  ?? primary;

    return (
        <section
            className="relative flex min-h-[280px] items-center justify-center overflow-hidden"
            style={{ backgroundColor: primary }}
        >
            {s.hero_image && (
                <img
                    src={s.hero_image}
                    alt={name}
                    className="absolute inset-0 h-full w-full object-cover opacity-40"
                />
            )}

            <div className="relative z-10 px-6 py-14 text-center text-white">
                <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{name}</h1>
                {s.store_tagline && (
                    <p className="mt-3 text-base text-white/75 sm:text-lg">{s.store_tagline}</p>
                )}
                <a
                    href="#products"
                    className="mt-6 inline-flex items-center gap-2 rounded-full px-7 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: accent }}
                >
                    Shop Now ↓
                </a>
            </div>
        </section>
    );
}
