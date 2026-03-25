import { router, useForm } from '@inertiajs/react';
import ProductForm, { type ProductFormData } from '@/components/admin/products/ProductForm';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { uploadMedia } from '@/lib/media-upload';
import { show } from '@/routes/businesses';
import { create, index, store } from '@/routes/businesses/products';
import type { Business, Category } from '@/types';

type Props = {
    business:   Business;
    categories: Category[];
};

export default function CreateProduct({ business, categories }: Props) {
    const b = { business: business.slug };

    const { data, setData, processing, errors } = useForm<ProductFormData>({
        name:        '',
        slug:        '',
        description: '',
        price:       '',
        stock:       '0',
        category_id: '',
        is_active:   true,
        images:      [],
    });

    const handleSubmit = async () => {
        const hasPending = data.images.some((img) => img.file);

        if (!hasPending) {
            router.post(store(b).url, data as any);
            return;
        }

        const resolved = await Promise.all(
            data.images.map(async (img) => {
                if (!img.file) { return { url: img.url, alt: img.alt }; }
                const url = await uploadMedia(img.file, business.slug);
                URL.revokeObjectURL(img.url);
                return { url, alt: img.alt };
            }),
        );

        router.post(store(b).url, { ...data, images: resolved } as any);
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
                    onSubmit={() => { void handleSubmit(); }}
                    onChange={(key, value) => setData(key, value)}
                />
            </div>
        </AppSidebarLayout>
    );
}
