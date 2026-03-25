import type { Business, PaginatedData, Page, Product } from '@/types/business';
import BoutiqueThemeShell from './ThemeShell';
import HeroBanner from './Components/HeroBanner';
import LookbookGrid from './Components/LookbookGrid';
import TestimonialRow from './Components/TestimonialRow';

interface Props {
    business: Business;
    products: PaginatedData<Product>;
    pages:    Page[];
}

export default function BoutiqueLayout({ business, products, pages }: Props) {
    const { theme_settings: s } = business;

    return (
        <BoutiqueThemeShell business={business} pages={pages}>
            {({ addToCart, trackEvent }) => (
                <>
                    <HeroBanner business={business} />

                    <section id="collection" className="px-4 py-16 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <LookbookGrid
                                products={products.data}
                                onAddToCart={(item) => {
                                    addToCart(item);
                                    trackEvent('AddToCart', { content_name: item.name, value: item.price, currency: 'GHS' });
                                }}
                                settings={s}
                            />
                        </div>
                    </section>

                    {s.show_testimonials && <TestimonialRow />}
                </>
            )}
        </BoutiqueThemeShell>
    );
}
