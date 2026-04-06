import { useState } from 'react';
import InputError from '@/components/input-error';
import { RichDescriptionEditor } from '@/components/admin/products/RichDescriptionEditor';
import { Label } from '@/components/ui/label';

interface Props {
    value: string;
    error?: string;
    businessSlug: string;
    defaultRichText?: boolean;
    onChange: (value: string) => void;
}

export function ProductDescriptionField({ value, error, businessSlug, defaultRichText = false, onChange }: Props) {
    const [richText, setRichText] = useState(() => defaultRichText || /<[a-z][\s\S]*>/i.test(value ?? ''));

    return (
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
                    onClear={() => onChange('')}
                    value={value}
                    onChange={onChange}
                    placeholder="Describe your product..."
                    businessSlug={businessSlug}
                />
            ) : (
                <textarea
                    id="description"
                    rows={4}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Describe your product..."
                    className="w-full rounded-lg border border-site-border px-3 py-2 text-sm text-site-fg placeholder:text-site-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                />
            )}
            <InputError message={error} />
        </div>
    );
}
