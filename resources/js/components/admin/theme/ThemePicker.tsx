import { router } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { switchMethod } from '@/routes/businesses/theme';
import type { Business, ThemeId } from '@/types';

const THEMES: { id: ThemeId; label: string; description: string }[] = [
    {
        id: 'classic',
        label: 'Classic',
        description: 'Clean, versatile layout. Works for any product category.',
    },
    {
        id: 'boutique',
        label: 'Boutique',
        description: 'Editorial, fashion-forward. Perfect for clothing & lifestyle.',
    },
];

type Props = {
    business: Business;
    activeTheme: ThemeId;
    onChange: (themeId: ThemeId) => void;
};

export function ThemePicker({ business, activeTheme, onChange }: Props) {
    const handleSwitch = (themeId: ThemeId) => {
        if (themeId === activeTheme) {
            return;
        }

        onChange(themeId);

        router.visit(switchMethod({ business: business.slug, themeId }).url, {
            method: 'patch',
            preserveScroll: true,
        });
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {THEMES.map(({ id, label, description }) => {
                const isActive = activeTheme === id;

                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => handleSwitch(id)}
                        className={`flex items-start gap-4 rounded-xl border p-4 text-left transition ${
                            isActive
                                ? 'border-brand bg-brand-dim'
                                : 'border-site-border bg-white hover:border-brand/50'
                        }`}
                    >
                        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            isActive ? 'border-brand' : 'border-site-border'
                        }`}>
                            {isActive && <Check className="h-3 w-3 text-brand" />}
                        </div>
                        <div>
                            <p className={`text-sm font-semibold ${isActive ? 'text-brand' : 'text-site-fg'}`}>
                                {label}
                            </p>
                            <p className="mt-0.5 text-xs text-site-muted">{description}</p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
