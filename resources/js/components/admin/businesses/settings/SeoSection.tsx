import { FormSection } from '@/components/admin/form-section';
import { FileUploader } from '@/components/admin/theme/FileUploader';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Business } from '@/types';
import { Field } from './Field';

type Props = {
    business: Business;
    seoTitle: string;
    seoDescription: string;
    showBranding: boolean;
    errors: Partial<Record<'seo_title' | 'seo_description' | 'seo_image', string>>;
    onSeoTitleChange: (value: string) => void;
    onSeoDescriptionChange: (value: string) => void;
    onSeoImageChange: (file: File | null) => void;
    onShowBrandingChange: (value: boolean) => void;
};

export function SeoSection({
    business,
    seoTitle,
    seoDescription,
    showBranding,
    errors,
    onSeoTitleChange,
    onSeoDescriptionChange,
    onSeoImageChange,
    onShowBrandingChange,
}: Props) {
    return (
        <FormSection
            title="SEO"
            description="Control how your store appears in Google, Facebook, and WhatsApp link previews."
        >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="SEO Title" error={errors.seo_title}>
                    <Input
                        value={seoTitle}
                        onChange={(e) => onSeoTitleChange(e.target.value)}
                        placeholder={business.name}
                        maxLength={70}
                        className="border-site-border focus-visible:ring-brand/30"
                    />
                    <p className="text-right text-[11px] text-site-muted/60">{seoTitle.length}/70</p>
                </Field>

                <Field label="Social Share Image" error={errors.seo_image}>
                    <FileUploader
                        business={business}
                        value={business.seo_image ?? undefined}
                        dimensions="1200×630 px"
                        onChange={(file) => onSeoImageChange(file ?? null)}
                    />
                    <p className="text-xs text-site-muted">Shown when your store is shared on social media. Falls back to logo.</p>
                </Field>
            </div>

            <Field label="Meta Description" error={errors.seo_description}>
                <Textarea
                    value={seoDescription}
                    onChange={(e) => onSeoDescriptionChange(e.target.value)}
                    placeholder={business.tagline ?? business.description ?? 'Describe your store for search engines...'}
                    rows={3}
                    maxLength={300}
                    className="resize-none border-site-border focus-visible:ring-brand/30"
                />
                <p className="text-right text-[11px] text-site-muted/60">{seoDescription.length}/300</p>
            </Field>

            <div className="rounded-lg border border-site-border bg-site-surface p-4">
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={showBranding}
                        onChange={(e) => onShowBrandingChange(e.target.checked)}
                        className="h-4 w-4 rounded border-site-border accent-brand"
                    />
                    <div>
                        <p className="text-sm font-medium text-site-fg">Show "Powered by biizz.app" in footer</p>
                        <p className="text-xs text-site-muted">
                            When off, shows "© {new Date().getFullYear()} {business.name}. All rights reserved." instead.
                        </p>
                    </div>
                </label>
            </div>
        </FormSection>
    );
}
