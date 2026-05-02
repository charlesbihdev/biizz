import { Lock } from 'lucide-react';
import { FormSection } from '@/components/admin/form-section';
import { FileUploader } from '@/components/admin/theme/FileUploader';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTier } from '@/hooks/use-tier';
import { useUpgradeModal } from '@/stores/upgrade-modal-store';
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
    const { can } = useTier();
    const showUpgrade = useUpgradeModal((s) => s.show);
    const canHideBranding = can('storefront.no_branding');

    // The control is "Hide 'Powered by biizz.app'" — semantically the inverse
    // of the persisted `show_branding` field. Visible-but-grayed: on Free
    // this is rendered unticked + disabled (the user cannot hide branding).
    // The backend force-flips show_branding=true on Free regardless of
    // submitted value, see UpdateBusinessSettingsRequest::prepareForValidation.
    const isChecked = canHideBranding ? !showBranding : false;

    const handleToggle = (next: boolean) => {
        if (!canHideBranding) return;
        // Invert: ticked → hide branding → show_branding=false.
        onShowBrandingChange(!next);
    };

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

            <div
                className={`rounded-lg border p-4 transition ${
                    canHideBranding
                        ? 'border-site-border bg-site-surface'
                        : 'border-brand/20 bg-brand/5'
                }`}
            >
                <div className="flex items-start gap-3">
                    <input
                        id="hide-branding"
                        type="checkbox"
                        checked={isChecked}
                        disabled={!canHideBranding}
                        onChange={(e) => handleToggle(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-site-border accent-brand disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <label
                                htmlFor="hide-branding"
                                className={`text-sm font-medium text-site-fg ${canHideBranding ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                            >
                                Hide "Powered by biizz.app" from your storefront footer
                            </label>
                            {!canHideBranding && (
                                <button
                                    type="button"
                                    onClick={() => showUpgrade({ feature: 'storefront.no_branding' })}
                                    className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand transition hover:bg-brand/20"
                                >
                                    <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
                                    Pro
                                </button>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-site-muted">
                            {canHideBranding ? (
                                <>
                                    When ticked, the footer shows "© {new Date().getFullYear()} {business.name}. All rights reserved." instead.
                                </>
                            ) : (
                                <>
                                    On Free your storefront always shows the biizz badge.{' '}
                                    <button
                                        type="button"
                                        onClick={() => showUpgrade({ feature: 'storefront.no_branding' })}
                                        className="font-semibold text-brand hover:underline"
                                    >
                                        Upgrade to Pro
                                    </button>{' '}
                                    to hide it.
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </FormSection>
    );
}
