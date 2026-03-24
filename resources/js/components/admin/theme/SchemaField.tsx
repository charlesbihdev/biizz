import { FileUploader } from '@/components/admin/theme/FileUploader';
import { PalettePicker } from '@/components/admin/theme/PalettePicker';
import { Label } from '@/components/ui/label';
import type { Business, SchemaField as SchemaFieldType, ThemeSettings } from '@/types';

type Props = {
    fieldKey: string;
    field: SchemaFieldType;
    business: Business;
    value: ThemeSettings[string];
    onChange: (key: string, value: ThemeSettings[string]) => void;
};

export function SchemaField({ fieldKey, field, business, value, onChange }: Props) {
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
                    onChange={(primary, accent, id) => {
                        onChange('primary_color', primary);
                        onChange('accent_color', accent);
                        onChange(fieldKey, id);
                    }}
                />
            )}

            {field.type === 'file' && (
                <FileUploader
                    business={business}
                    value={value as string | undefined}
                    dimensions={field.dimensions}
                    onChange={(url) => onChange(fieldKey, url)}
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
        </div>
    );
}
