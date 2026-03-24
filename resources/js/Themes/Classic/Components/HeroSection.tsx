import type { Business } from '@/types/business';

interface Props {
    business: Business;
}

export default function HeroSection({ business }: Props) {
    const { theme_settings: s, name } = business;

    return (
        <section
            className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-zinc-900"
            style={s.primary_color ? { backgroundColor: s.primary_color } : undefined}
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
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-7 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
                >
                    Shop Now ↓
                </a>
            </div>
        </section>
    );
}
