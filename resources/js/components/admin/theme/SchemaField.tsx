import { FileUploader } from '@/components/admin/theme/FileUploader';
import { PalettePicker } from '@/components/admin/theme/PalettePicker';
import { ProductPickerField } from '@/components/admin/theme/ProductPickerField';
import { VideoEmbedField } from '@/components/admin/theme/VideoEmbedField';
import { Label } from '@/components/ui/label';
import { SimpleEditor } from '@/components/tiptap/templates/simple/simple-editor';
import type { Business, CompactProduct, SchemaField as SchemaFieldType, ThemeSettings } from '@/types';

type Props = {
    fieldKey:         string;
    field:            SchemaFieldType;
    business:         Business;
    value:            ThemeSettings[string];
    allSettings?:     ThemeSettings;
    onChange:         (key: string, value: ThemeSettings[string] | File) => void;
    compactProducts?: CompactProduct[];
};

export function SchemaField({ fieldKey, field, business, value, allSettings, onChange, compactProducts }: Props) {
    const id = `field-${fieldKey}`;

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>{field.label}</Label>

            {field.type === 'color' && (
                <div className="flex items-center gap-2">
                    <input
                        id={id}
                        type="color"
                        value={(value as string) || (field.default as string) || '#000000'}
                        onChange={(e) => onChange(fieldKey, e.target.value)}
                        className="h-9 w-9 cursor-pointer rounded-lg border border-site-border p-0.5"
                    />
                    <input
                        type="text"
                        value={(value as string) || (field.default as string) || ''}
                        onChange={(e) => onChange(fieldKey, e.target.value)}
                        placeholder="#000000"
                        className="w-28 rounded-lg border border-site-border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                    />
                </div>
            )}

            {field.type === 'palette' && (
                <PalettePicker
                    value={value as string | undefined}
                    primary={allSettings?.primary_color as string | undefined ?? business.theme_settings?.primary_color}
                    accent={allSettings?.accent_color as string | undefined ?? business.theme_settings?.accent_color}
                    bg={allSettings?.bg_color as string | undefined ?? business.theme_settings?.bg_color}
                    onChange={(primary, accent, bg, id) => {
                        onChange('primary_color', primary);
                        onChange('accent_color', accent);
                        onChange('bg_color', bg);
                        onChange(fieldKey, id ?? '');
                    }}
                />
            )}

            {field.type === 'file' && (
                <FileUploader
                    business={business}
                    value={value as string | undefined}
                    dimensions={field.dimensions}
                    onChange={(file) => onChange(fieldKey, file !== null ? file : '')}
                />
            )}

            {field.type === 'text' && (
                <input
                    id={id}
                    type="text"
                    value={(value as string) || ''}
                    onChange={(e) => onChange(fieldKey, e.target.value)}
                    placeholder={field.placeholder}
                    className="rounded-lg border border-site-border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                />
            )}

            {field.type === 'boolean' && (
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        id={id}
                        type="checkbox"
                        checked={(value as boolean) ?? (field.default as boolean) ?? false}
                        onChange={(e) => onChange(fieldKey, e.target.checked)}
                        className="h-4 w-4 rounded border-site-border accent-brand"
                    />
                    <span className="text-sm text-site-fg">Enabled</span>
                </label>
            )}

            {field.type === 'select' && field.options && (
                <select
                    id={id}
                    value={(value as string) || (field.default as string) || ''}
                    onChange={(e) => onChange(fieldKey, e.target.value)}
                    className="rounded-lg border border-site-border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                >
                    {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                    ))}
                </select>
            )}

            {field.type === 'richtext' && (
                <SimpleEditor
                    value={(value as string) || ''}
                    onChange={(html) => onChange(fieldKey, html)}
                    placeholder={field.placeholder}
                    businessSlug={business.slug}
                />
            )}

            {field.type === 'video' && (
                <VideoEmbedField
                    value={value as string | undefined}
                    onChange={(url) => onChange(fieldKey, url)}
                />
            )}

            {field.type === 'product' && (
                <ProductPickerField
                    value={value as number | null | undefined}
                    products={compactProducts ?? []}
                    onChange={(id) => onChange(fieldKey, id as ThemeSettings[string])}
                />
            )}
        </div>
    );
}
