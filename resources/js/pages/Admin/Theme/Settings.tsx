import { router } from '@inertiajs/react';
import { Eye, LoaderCircle, X } from 'lucide-react';
import { useState } from 'react';
import { uploadMedia } from '@/lib/media-upload';
import { LivePreview } from '@/components/admin/theme/LivePreview';
import { SchemaField } from '@/components/admin/theme/SchemaField';
import { ThemePicker } from '@/components/admin/theme/ThemePicker';
import { FormSection } from '@/components/admin/form-section';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { edit, update } from '@/routes/businesses/theme';
import type { Business, ThemeId, ThemeSettings } from '@/types';
import { SCHEMA_MAP } from '@/types/theme';

export default function ThemeSettings({ business }: { business: Business }) {
    const b = { business: business.slug };

    const [activeTheme, setActiveTheme] = useState<ThemeId>(business.theme_id as ThemeId);
    const [settings, setSettings] = useState<ThemeSettings>({ ...business.theme_settings });
    const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
    const [saving, setSaving] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    const schema = SCHEMA_MAP[activeTheme];
    const isCompactField = (fieldType: string): boolean => fieldType === 'boolean' || fieldType === 'select';

    const handleFieldChange = (key: string, value: ThemeSettings[string] | File) => {
        if (value instanceof File) {
            setPendingFiles((prev) => ({ ...prev, [key]: value }));
        } else {
            setSettings((prev) => ({ ...prev, [key]: value }));
            setPendingFiles((prev) => { const next = { ...prev }; delete next[key]; return next; });
        }
    };

    const handleSave = async () => {
        setSaving(true);

        let resolvedSettings = { ...settings };

        if (Object.keys(pendingFiles).length > 0) {
            const uploads = await Promise.all(
                Object.entries(pendingFiles).map(async ([key, file]) => {
                    const url = await uploadMedia(file, business.slug);
                    return [key, url] as [string, string];
                }),
            );
            uploads.forEach(([key, url]) => { resolvedSettings[key] = url; });
            setPendingFiles({});
            setSettings(resolvedSettings);
        }

        router.visit(update(b).url, {
            method: 'post',
            data: { _method: 'patch', ...resolvedSettings as any },
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: show(b).url },
                { title: 'Theme', href: edit(b).url },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-site-fg">Theme</h1>
                        <p className="mt-1 text-sm text-site-muted">Customise how your store looks.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        className="flex items-center gap-2 rounded-full border border-site-border px-4 py-2 text-sm font-medium text-site-fg transition hover:border-zinc-400 hover:bg-site-surface"
                    >
                        <Eye className="h-4 w-4" />
                        Preview
                    </button>
                </div>

                <div className="flex flex-col gap-8">
                    <FormSection title="Layout" description="Choose the base structure of your store.">
                        <ThemePicker
                            business={business}
                            activeTheme={activeTheme}
                            onChange={setActiveTheme}
                        />
                    </FormSection>

                    <FormSection title="Settings" description="Customize fonts, colors, and layout preferences.">
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            {Object.entries(schema).map(([key, field]) => (
                                <div key={key} className={isCompactField(field.type) ? '' : 'lg:col-span-2'}>
                                    <SchemaField
                                        fieldKey={key}
                                        field={field}
                                        business={business}
                                        value={settings[key]}
                                        allSettings={settings}
                                        onChange={handleFieldChange}
                                    />
                                </div>
                            ))}
                        </div>
                    </FormSection>

                    {/* ── Save ── */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                        >
                            {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Save changes
                        </button>
                    </div>
                </div>
            </div>

            {/* ── LivePreview (hidden, loads in bg for instant modal open) ── */}
            <div aria-hidden className="hidden">
                <LivePreview slug={business.slug} settings={settings} />
            </div>

            {/* ── Preview modal ── */}
            {previewOpen && (
                <div className="fixed inset-0 z-50 flex flex-col bg-white">
                    <div className="flex items-center justify-between border-b border-site-border px-4 py-3">
                        <p className="text-sm font-semibold text-site-fg">Storefront Preview</p>
                        <button
                            type="button"
                            onClick={() => setPreviewOpen(false)}
                            className="rounded-full p-1.5 text-site-muted transition hover:bg-site-surface hover:text-site-fg"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex-1">
                        <LivePreview slug={business.slug} settings={settings} />
                    </div>
                </div>
            )}
        </AppSidebarLayout>
    );
}
