import type { Business } from '@/types/business';
import { useSemanticTokens } from '@/Themes/Shared/Hooks/useSemanticTokens';

interface Props {
    business: Business;
}

export default function HeroSection({ business }: Props) {
    const { name, theme_settings: s } = business;
    const tokens = useSemanticTokens(business);
    const heroImage    = typeof s.hero_image === 'string' ? s.hero_image : null;
    const storeTagline = typeof s.store_tagline === 'string' ? s.store_tagline : null;

    return (
        <section
            className="relative flex min-h-[280px] items-center justify-center overflow-hidden"
            style={{ backgroundColor: tokens.ctaBg }}
        >
            {heroImage && (
                <img
                    src={heroImage}
                    alt={name}
                    className="absolute inset-0 h-full w-full object-cover opacity-40"
                />
            )}

            <div
                className="relative z-10 px-6 py-14 text-center"
                style={{ color: tokens.ctaFg }}
            >
                <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{name}</h1>
                {storeTagline && (
                    <p className="mt-3 text-base opacity-75 sm:text-lg">{storeTagline}</p>
                )}
                <a
                    href="#products"
                    className="mt-6 inline-flex items-center gap-2 rounded-full px-7 py-2.5 text-sm font-semibold transition hover:opacity-90"
                    style={{ backgroundColor: tokens.highlightStrong, color: tokens.ctaFg }}
                >
                    Shop Now ↓
                </a>
            </div>
        </section>
    );
}
