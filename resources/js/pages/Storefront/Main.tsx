import BoutiqueLayout from '@/Themes/Boutique/Layout';
import ClassicLayout from '@/Themes/Classic/Layout';
import type { Business, Product } from '@/types';

type Props = {
    business: Business & { products?: Product[] };
    isPreview?: boolean;
};

const THEME_MAP = {
    classic:  ClassicLayout,
    boutique: BoutiqueLayout,
} as const;

export default function StorefrontMain({ business, isPreview = false }: Props) {
    const ThemeLayout = THEME_MAP[business.theme_id as keyof typeof THEME_MAP] ?? ClassicLayout;
    const products = business.products ?? [];

    return (
        <>
            {isPreview && (
                <div className="fixed inset-x-0 top-0 z-50 bg-amber-500 py-1.5 text-center text-xs font-semibold text-white">
                    Preview mode — changes are not saved
                </div>
            )}
            <ThemeLayout business={business} products={products} />
        </>
    );
}
