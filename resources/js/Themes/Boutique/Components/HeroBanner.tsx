import type { Business } from '@/types/business';

interface Props {
    business: Business;
}

type BoutiqueHeroSettings = {
    highlight_color?: string;
    hero_image?: string;
    store_tagline?: string;
};

export default function HeroBanner({ business }: Props) {
    const { name } = business;
    const s = business.theme_settings as BoutiqueHeroSettings;
    const accent = s.highlight_color ?? '#1a1a1a';

    return (
        <section className="relative flex min-h-screen items-end overflow-hidden bg-zinc-950">
            {s.hero_image && (
                <img
                    src={s.hero_image}
                    alt={name}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            )}

            {/* Gradient overlay — stronger at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

            {/* Content */}
            <div className="relative z-10 w-full px-6 pb-16 sm:px-12 lg:px-16">
                <div className="max-w-3xl">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                        Collection
                    </p>
                    <h1 className="text-5xl font-bold leading-none tracking-tight text-white sm:text-6xl lg:text-7xl">
                        {name}
                    </h1>
                    {s.store_tagline && (
                        <p className="mt-4 max-w-xl text-lg font-light text-white/75">{s.store_tagline}</p>
                    )}
                    <a
                        href="#collection"
                        className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
                        style={{ backgroundColor: accent }}
                    >
                        Explore Collection
                    </a>
                </div>
            </div>
        </section>
    );
}
