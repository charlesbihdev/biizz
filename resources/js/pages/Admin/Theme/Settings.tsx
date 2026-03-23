import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { LivePreview } from '@/components/admin/theme/LivePreview';
import { SchemaField } from '@/components/admin/theme/SchemaField';
import { ThemePicker } from '@/components/admin/theme/ThemePicker';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { edit, update } from '@/routes/businesses/theme';
import { SCHEMA_MAP } from '@/types/theme';
import type { Business, ThemeId, ThemeSettings } from '@/types';

export default function ThemeSettings({ business }: { business: Business }) {
    const b = { business: business.slug };

    const [activeTheme, setActiveTheme] = useState<ThemeId>(business.theme_id as ThemeId);
    const [settings, setSettings] = useState<ThemeSettings>({ ...business.theme_settings });
    const [saving, setSaving] = useState(false);

    const schema = SCHEMA_MAP[activeTheme];

    const handleFieldChange = (key: string, value: ThemeSettings[string]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        setSaving(true);

        router.visit(update(b).url, {
            method: 'patch',
            data: settings as Record<string, unknown>,
            preserveScroll: true,
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
            <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row lg:overflow-hidden">

                {/* Settings panel */}
                <div className="flex w-full flex-col gap-6 overflow-y-auto p-6 lg:w-80 lg:shrink-0 lg:p-6 xl:w-96">
                    <div>
                        <h1 className="text-xl font-bold text-site-fg">Theme</h1>
                        <p className="mt-0.5 text-sm text-site-muted">
                            Customise how your store looks.
                        </p>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-site-muted">
                            Layout
                        </p>
                        <ThemePicker
                            business={business}
                            activeTheme={activeTheme}
                            onChange={setActiveTheme}
                        />
                    </div>

                    <div className="flex flex-col gap-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-site-muted">
                            Settings
                        </p>
                        {Object.entries(schema).map(([key, field]) => (
                            <SchemaField
                                key={key}
                                fieldKey={key}
                                field={field}
                                business={business}
                                value={settings[key]}
                                onChange={handleFieldChange}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                    >
                        {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Save changes
                    </button>
                </div>

                {/* Live preview */}
                <div className="hidden flex-1 p-4 lg:flex lg:p-6 lg:pl-0">
                    <LivePreview slug={business.slug} settings={settings} />
                </div>

            </div>
        </AppSidebarLayout>
    );
}
