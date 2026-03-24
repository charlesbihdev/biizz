import { useForm } from '@inertiajs/react';
import ProductForm, { type ProductFormData } from '@/components/admin/products/ProductForm';
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

    const { data, setData, submit, processing, errors } = useForm<ProductFormData>({
        name:        product.name,
        description: product.description ?? '',
        price:       product.price,
        stock:       String(product.stock),
        category_id: product.category_id ? String(product.category_id) : '',
        is_active:   product.is_active,
        images:      product.images.map((img) => ({ url: img.url, alt: img.alt ?? '' })),
    });

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: show(b).url },
                { title: 'Products',    href: index(b).url },
                { title: product.name,  href: edit({ ...b, product: product.id }).url },
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
                    data={data}
                    errors={errors}
                    processing={processing}
                    submitLabel="Save changes"
                    onSubmit={() => submit(update({ ...b, product: product.id }))}
                    onChange={(key, value) => setData(key, value)}
                />
            </div>
        </AppSidebarLayout>
    );
}
