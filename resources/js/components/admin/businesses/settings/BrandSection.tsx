import { FormSection } from '@/components/admin/form-section';
import { FileUploader } from '@/components/admin/theme/FileUploader';
import { Input } from '@/components/ui/input';
import type { Business } from '@/types';
import { Field } from './Field';

type Props = {
    business: Business;
    tagline: string;
    errors: Partial<Record<'logo' | 'favicon' | 'tagline', string>>;
    onTaglineChange: (value: string) => void;
    onLogoChange: (file: File | null) => void;
    onFaviconChange: (file: File | null) => void;
};

export function BrandSection({ business, tagline, errors, onTaglineChange, onLogoChange, onFaviconChange }: Props) {
    return (
        <FormSection
            title="Brand"
            description="Your logo and tagline appear on your storefront across all themes."
        >
            <Field label="Logo" error={errors.logo}>
                <FileUploader
                    business={business}
                    value={business.logo_url ?? undefined}
                    onChange={(file) => onLogoChange(file ?? null)}
                />
                <p className="text-xs text-site-muted">PNG, JPG or SVG. Falls back to your business name if not set.</p>
            </Field>

            <Field label="Favicon" error={errors.favicon}>
                <FileUploader
                    business={business}
                    value={business.favicon_url ?? undefined}
                    dimensions="32×32 px recommended"
                    onChange={(file) => onFaviconChange(file ?? null)}
                />
                <p className="text-xs text-site-muted">Small icon shown in browser tabs. Falls back to your logo if not set.</p>
            </Field>

            <Field label="Tagline" error={errors.tagline}>
                <Input
                    value={tagline}
                    onChange={(e) => onTaglineChange(e.target.value)}
                    placeholder="Dress to impress, every day."
                    maxLength={150}
                    className="border-site-border focus-visible:ring-brand/30"
                />
                <p className="text-right text-[11px] text-site-muted/60">{tagline.length}/150</p>
            </Field>
        </FormSection>
    );
}
