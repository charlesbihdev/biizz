import { useForm } from '@inertiajs/react';
import ProductForm from '@/components/admin/products/ProductForm';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { edit, index, update } from '@/routes/businesses/products';
import type { Business, Category, Product } from '@/types';

type Props = {
    business:   Business;
    product:    Product;
    categories: Category[];
};

export default function EditProduct({ business, product, categories }: Props) {
    const b = { business: business.slug };

    const { data, setData, post, processing, errors } = useForm({
        _method:          'patch' as string,
        name:             product.name,
        slug:             product.slug ?? '',
        description:      product.description ?? '',
        price:            product.price,
        compare_at_price: product.compare_at_price ?? '',
        stock:            String(product.stock),
        category_id:      product.category_id ? String(product.category_id) : '',
        digital_category: product.digital_category ?? 'others',
        is_active:        product.is_active,
        images:           product.images.map((img) => ({ url: img.url, alt: img.alt ?? '' })),
        promo_video:      product.promo_video ?? '',
        tags:             product.tags ?? [],
    });

    const handleSubmit = () => {
        post(update({ ...b, product: product.slug }).url, {
            preserveScroll: true,
            preserveState:  true,
            forceFormData:  true,
        });
    };

    const { _method: _, ...productData } = data;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: show(b).url },
                { title: 'Products',    href: index(b).url },
                { title: product.name,  href: edit({ ...b, product: product.slug }).url },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-site-fg">Edit product</h1>
                    <p className="mt-1 text-sm text-site-muted">{product.name}</p>
                </div>

                <ProductForm
                    business={business}
                    categories={categories}
                    data={productData}
                    errors={errors}
                    processing={processing}
                    submitLabel="Save changes"
                    onSubmit={handleSubmit}
                    onChange={(key, value) => setData(key, value as never)}
                />
            </div>
        </AppSidebarLayout>
    );
}
