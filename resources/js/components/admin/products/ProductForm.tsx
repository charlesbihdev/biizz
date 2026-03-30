import { Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import {
    ImageUploader,
    type UploadedImage,
} from '@/components/admin/products/ImageUploader';
import { RichDescriptionEditor } from '@/components/admin/products/RichDescriptionEditor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as categoriesIndex } from '@/routes/businesses/categories';
import type { Business, Category } from '@/types';

export interface ProductFormData {
    name: string;
    slug: string;
    description: string;
    price: string;
    stock: string;
    category_id: string;
    is_active: boolean;
    images: UploadedImage[];
}

interface Props {
    business: Business;
    categories: Category[];
    data: ProductFormData;
    errors: Partial<Record<keyof ProductFormData, string>>;
    processing: boolean;
    submitLabel: string;
    onSubmit: () => void;
    onChange: <K extends keyof ProductFormData>(
        key: K,
        value: ProductFormData[K],
    ) => void;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s]+/g, '-')
        .replace(/-+/g, '-');
}

export default function ProductForm({
    business,
    categories,
    data,
    errors,
    processing,
    submitLabel,
    onSubmit,
    onChange,
}: Props) {
    const isDigital = business.business_type === 'digital';

    const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!data.slug);

    useEffect(() => {
        if (!slugManuallyEdited) {
            onChange('slug', slugify(data.name));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.name]);

    const [richText, setRichText] = useState(() =>
        /<[a-z][\s\S]*>/i.test(data.description ?? ''),
    );

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8"
        >
            {/* ── Left: content ── */}
            <div className="flex min-w-0 flex-1 flex-col gap-5">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name">Product name</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        placeholder="e.g. White Linen Dress"
                        autoFocus
                        className="border-site-border focus-visible:ring-brand/30"
                    />
                    <InputError message={errors.name} />
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                        id="slug"
                        value={data.slug}
                        onChange={(e) => {
                            setSlugManuallyEdited(true);
                            onChange('slug', e.target.value);
                        }}
                        placeholder="e.g. white-linen-dress"
                        className="border-site-border font-mono text-sm focus-visible:ring-brand/30"
                    />
                    <InputError message={errors.slug} />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="description">Description</Label>
                        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-site-muted">
                            <input
                                type="checkbox"
                                checked={richText}
                                onChange={(e) => setRichText(e.target.checked)}
                                className="h-3.5 w-3.5 accent-brand"
                            />
                            Rich text
                        </label>
                    </div>
                    {richText ? (
                        <RichDescriptionEditor
                            onClear={() => onChange('description', '')}
                            value={data.description}
                            onChange={(html) => onChange('description', html)}
                            placeholder="Describe your product..."
                            businessSlug={business.slug}
                        />
                    ) : (
                        <textarea
                            id="description"
                            rows={4}
                            value={data.description}
                            onChange={(e) =>
                                onChange('description', e.target.value)
                            }
                            placeholder="Describe your product..."
                            className="w-full rounded-lg border border-site-border px-3 py-2 text-sm text-site-fg placeholder:text-site-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                        />
                    )}
                    <InputError message={errors.description} />
                </div>

                {/* Images */}
                {!isDigital && (
                    <div className="flex flex-col gap-1.5">
                        <Label>Product photos</Label>
                        <ImageUploader
                            businessSlug={business.slug}
                            images={data.images}
                            onChange={(imgs) => onChange('images', imgs)}
                        />
                        <p className="text-xs text-site-muted">
                            First photo is the main image. Max 8 photos, 6 MB
                            each.
                        </p>
                    </div>
                )}
            </div>

            {/* ── Right: sidebar ── */}
            <div className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
                {/* Status */}
                <div className="rounded-2xl border border-site-border bg-white p-4">
                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) =>
                                onChange('is_active', e.target.checked)
                            }
                            className="h-4 w-4 rounded border-site-border accent-brand"
                        />
                        <div>
                            <p className="text-sm font-medium text-site-fg">
                                Visible on storefront
                            </p>
                            <p className="text-xs text-site-muted">
                                Customers can see and buy this product
                            </p>
                        </div>
                    </label>
                </div>

                {/* Organise */}
                <div className="flex flex-col gap-4 rounded-2xl border border-site-border bg-white p-4">
                    <p className="text-xs font-semibold tracking-wide text-site-muted uppercase">
                        Organise
                    </p>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="category_id">Category</Label>
                        {categories.length === 0 ? (
                            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                No categories.{' '}
                                <Link
                                    href={
                                        categoriesIndex({
                                            business: business.slug,
                                        }).url
                                    }
                                    className="font-semibold underline underline-offset-2"
                                >
                                    Manage →
                                </Link>
                            </p>
                        ) : (
                            <select
                                id="category_id"
                                value={data.category_id}
                                onChange={(e) =>
                                    onChange('category_id', e.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                            >
                                <option value="" disabled>
                                    Select a category
                                </option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <InputError message={errors.category_id} />
                    </div>
                </div>

                {/* Pricing */}
                <div className="flex flex-col gap-4 rounded-2xl border border-site-border bg-white p-4">
                    <p className="text-xs font-semibold tracking-wide text-site-muted uppercase">
                        Pricing
                    </p>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="price">Price (GHS)</Label>
                        <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.price}
                            onChange={(e) => onChange('price', e.target.value)}
                            placeholder="0.00"
                            className="border-site-border focus-visible:ring-brand/30"
                        />
                        <InputError message={errors.price} />
                    </div>

                    {isDigital ? (
                        <div className="flex flex-col gap-1.5">
                            <Label>Stock</Label>
                            <p className="rounded-lg border border-site-border bg-site-surface px-3 py-2 text-sm text-site-muted">
                                Unlimited — digital product
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="stock">Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={data.stock}
                                onChange={(e) =>
                                    onChange('stock', e.target.value)
                                }
                                className="border-site-border focus-visible:ring-brand/30"
                            />
                            <InputError message={errors.stock} />
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={processing}
                    className="mb-8 flex items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                >
                    {processing && (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    )}
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
