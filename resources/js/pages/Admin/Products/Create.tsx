import { useForm } from '@inertiajs/react';
import ProductForm, { type ProductFormData } from '@/components/admin/products/ProductForm';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { create, index, store } from '@/routes/businesses/products';
import type { Business, Category } from '@/types';

type Props = {
    business:   Business;
    categories: Category[];
};

export default function CreateProduct({ business, categories }: Props) {
    const b = { business: business.slug };

    const { data, setData, post, processing, errors } = useForm<ProductFormData>({
        name:        '',
        slug:        '',
        description: '',
        price:       '',
        stock:       '0',
        category_id: '',
        is_active:   true,
        images:      [],
    });

    console.log(errors);

    const handleSubmit = () => {
        post(store(b).url, {
            preserveScroll: true,
            preserveState:  true,
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: show(b).url },
                { title: 'Products',    href: index(b).url },
                { title: 'New product', href: create(b).url },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-site-fg">New product</h1>
                    <p className="mt-1 text-sm text-site-muted">Add a product to {business.name}.</p>
                </div>

                <ProductForm
                    business={business}
                    categories={categories}
                    data={data}
                    errors={errors}
                    processing={processing}
                    submitLabel="Save product"
                    onSubmit={handleSubmit}
                    onChange={(key, value) => setData(key, value as never)}
                />
            </div>
        </AppSidebarLayout>
    );
}
