import { LoaderCircle, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { DigitalCategoryField } from '@/components/admin/products/DigitalCategoryField';
import { ImageUploader, type UploadedImage } from '@/components/admin/products/ImageUploader';
import { ProductDescriptionField } from '@/components/admin/products/ProductDescriptionField';
import { ProductPricingCard } from '@/components/admin/products/ProductPricingCard';
import { ProductTagsField } from '@/components/admin/products/ProductTagsField';
import { QuickAddCategoryDialog } from '@/components/admin/products/QuickAddCategoryDialog';
import { VideoEmbedField } from '@/components/admin/theme/VideoEmbedField';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProductFields } from '@/Themes/registry';
import type { Business, Category } from '@/types';

export interface ProductFormData {
    name:             string;
    slug:             string;
    description:      string;
    price:            string;
    compare_at_price: string;
    stock:            string;
    category_id:      string;
    digital_category: string;
    is_active:        boolean;
    images:           UploadedImage[];
    promo_video:      string;
    tags:             string[];
}

interface Props {
    business: Business;
    categories: Category[];
    data: ProductFormData;
    errors: Partial<Record<keyof ProductFormData, string>>;
    processing: boolean;
    submitLabel: string;
    onSubmit: () => void;
    onChange: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s]+/g, '-')
        .replace(/-+/g, '-');
}

export default function ProductForm({ business, categories, data, errors, processing, submitLabel, onSubmit, onChange }: Props) {
    const isDigital   = business.business_type === 'digital';
    const themeFields = getProductFields(business.theme_id);

    const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!data.slug);
    const [quickAddOpen, setQuickAddOpen]             = useState(false);
    const pendingCategoryName                         = useRef<string | null>(null);

    useEffect(() => {
        if (!slugManuallyEdited) onChange('slug', slugify(data.name));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.name]);

    useEffect(() => {
        if (!pendingCategoryName.current) return;
        const found = categories.find((c) => c.name === pendingCategoryName.current);
        if (found) {
            onChange('category_id', String(found.id));
            pendingCategoryName.current = null;
        }
    }, [categories]);

    // ── Shared sidebar cards ──────────────────────────────────────────────────

    const visibilityCard = (
        <div className="rounded-2xl border border-site-border bg-white p-4">
            <label className="flex cursor-pointer items-center gap-3">
                <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={(e) => onChange('is_active', e.target.checked)}
                    className="h-4 w-4 rounded border-site-border accent-brand"
                />
                <div>
                    <p className="text-sm font-medium text-site-fg">
                        {isDigital ? 'Listed on marketplace' : 'Visible on storefront'}
                    </p>
                    <p className="text-xs text-site-muted">
                        {isDigital ? 'Buyers can discover and purchase this product' : 'Customers can see and buy this product'}
                    </p>
                </div>
            </label>
        </div>
    );

    const pricingCard = (
        <ProductPricingCard
            price={data.price}
            compareAtPrice={data.compare_at_price}
            stock={data.stock}
            isDigital={isDigital}
            errors={{ price: errors.price, compare_at_price: errors.compare_at_price, stock: errors.stock }}
            onChange={(field, val) => onChange(field, val)}
        />
    );

    const submitBtn = (
        <button
            type="submit"
            disabled={processing}
            className="mb-8 flex items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
        >
            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {submitLabel}
        </button>
    );

    return (
        <>
            <form
                onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
                className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8"
            >
                {/* ── Left: content ── */}
                <div className="flex min-w-0 flex-1 flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">Product name <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => onChange('name', e.target.value)}
                            placeholder={isDigital ? 'e.g. The $100/Day Formula' : 'e.g. White Linen Dress'}
                            autoFocus
                            required
                            className="border-site-border focus-visible:ring-brand/30"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={(e) => { setSlugManuallyEdited(true); onChange('slug', e.target.value); }}
                            placeholder="e.g. the-100-day-formula"
                            className="border-site-border font-mono text-sm focus-visible:ring-brand/30"
                        />
                        <InputError message={errors.slug} />
                    </div>

                    <ProductDescriptionField
                        value={data.description}
                        error={errors.description}
                        businessSlug={business.slug}
                        defaultRichText={isDigital}
                        onChange={(val) => onChange('description', val)}
                    />

                    {/* Physical: images + tags stay in left column */}
                    {!isDigital && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <Label>Product photos</Label>
                                <ImageUploader
                                    businessSlug={business.slug}
                                    images={data.images}
                                    onChange={(imgs) => onChange('images', imgs)}
                                />
                                <p className="text-xs text-site-muted">First photo is the main image. Max 8 photos, 6 MB each.</p>
                            </div>

                            <ProductTagsField
                                tags={data.tags}
                                error={errors.tags as string | undefined}
                                onChange={(val) => onChange('tags', val)}
                            />
                        </>
                    )}

                    {/* Theme-specific fields (physical themes only — digital has no theme) */}
                    {Object.entries(themeFields).map(([key, field]) => (
                        <div key={key} className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <Label>{field.label}</Label>
                                {field.hint && (
                                    <span
                                        className="cursor-default rounded-full border border-site-border px-2 py-0.5 text-[10px] text-site-muted"
                                        title={field.hint}
                                    >?</span>
                                )}
                            </div>
                            {field.type === 'video' && (
                                <VideoEmbedField
                                    value={(data as Record<string, string>)[key] ?? ''}
                                    onChange={(url) => onChange(key as keyof ProductFormData, url as never)}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Right: sidebar ── */}
                <div className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
                    {isDigital ? (
                        // ── Digital sidebar: cover → tags → category → pricing → submit ──
                        <>
                            {/* Cover image */}
                            <div className="flex flex-col gap-2 rounded-2xl border border-site-border bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-site-muted">Cover image</p>
                                <ImageUploader
                                    businessSlug={business.slug}
                                    images={data.images}
                                    onChange={(imgs) => onChange('images', imgs)}
                                />
                                <p className="text-xs text-site-muted">Shown on your marketplace listing. 6 MB max.</p>
                            </div>

                            {/* Tags */}
                            <div className="rounded-2xl border border-site-border bg-white p-4">
                                <ProductTagsField
                                    tags={data.tags}
                                    error={errors.tags as string | undefined}
                                    onChange={(val) => onChange('tags', val)}
                                />
                            </div>

                            {/* Platform category */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-site-border bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-site-muted">Organise</p>
                                <DigitalCategoryField
                                    value={data.digital_category}
                                    onChange={(val) => onChange('digital_category', val)}
                                />
                            </div>

                            {visibilityCard}
                            {pricingCard}
                            {submitBtn}
                        </>
                    ) : (
                        // ── Physical sidebar: visibility → category → pricing → submit ──
                        <>
                            {visibilityCard}

                            <div className="flex flex-col gap-4 rounded-2xl border border-site-border bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-site-muted">Organise</p>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="category_id">Category <span className="text-red-500">*</span></Label>
                                        <button
                                            type="button"
                                            onClick={() => setQuickAddOpen(true)}
                                            className="flex items-center gap-1 text-xs text-brand hover:text-brand-hover"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add
                                        </button>
                                    </div>
                                    <select
                                        id="category_id"
                                        value={data.category_id}
                                        onChange={(e) => onChange('category_id', e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.category_id} />
                                </div>
                            </div>

                            {pricingCard}
                            {submitBtn}
                        </>
                    )}
                </div>
            </form>

            {!isDigital && (
                <QuickAddCategoryDialog
                    business={business}
                    open={quickAddOpen}
                    onOpenChange={setQuickAddOpen}
                    onCreated={(name) => { pendingCategoryName.current = name; }}
                />
            )}
        </>
    );
}
