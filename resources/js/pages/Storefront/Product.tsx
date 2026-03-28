import { Suspense } from 'react';
import { THEME_MAP } from '@/types/theme';
import StorefrontHead from '@/Themes/Shared/StorefrontHead';
import type { Business, Page, Product } from '@/types/business';

function stripHtml(html: string | null | undefined): string {
    if (!html) { return ''; }
    return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 155);
}

type Props = {
    business: Business;
    product:  Product;
    related:  Product[];
    pages:    Page[];
};

export default function StorefrontProduct({ business, product, related, pages }: Props) {
    const ProductComponent = THEME_MAP[business.theme_id as keyof typeof THEME_MAP]?.Product;

    const productDescription = stripHtml(product.description);
    const productImage       = product.images[0]?.url;

    return (
        <Suspense fallback={null}>
            <StorefrontHead
                business={business}
                title={product.name}
                description={productDescription || undefined}
                image={productImage}
            />
            <ProductComponent business={business} product={product} related={related} pages={pages} />
        </Suspense>
    );
}
