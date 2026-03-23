import type { Business, Product } from '@/types/business';

interface Props {
    business: Business;
    products: Product[];
}

/**
 * Boutique theme — Phase 7 (after Classic theme is validated).
 * Stub in place so THEME_MAP resolves without errors.
 */
export default function BoutiqueLayout({ business }: Props) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
            <div className="text-center">
                <h1 className="text-3xl font-bold">{business.name}</h1>
                <p className="mt-2 text-zinc-400">Boutique theme — coming soon</p>
            </div>
        </div>
    );
}
