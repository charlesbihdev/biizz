import { PALETTES } from '@/Themes/Shared/palettes';

interface Props {
    value?: string;
    onChange: (primary: string, accent: string, id: string) => void;
}

export function PalettePicker({ value, onChange }: Props) {
    return (
        <div className="flex flex-wrap gap-3">
            {PALETTES.map((palette) => {
                const isSelected = value === palette.id;

                return (
                    <button
                        key={palette.id}
                        type="button"
                        title={palette.name}
                        onClick={() => onChange(palette.primary, palette.accent, palette.id)}
                        className={`group flex flex-col items-center gap-1.5 ${isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                    >
                        {/* Split-diagonal swatch */}
                        <span
                            className={`block h-9 w-9 overflow-hidden rounded-full border-2 transition ${
                                isSelected
                                    ? 'border-zinc-900 shadow-md ring-2 ring-zinc-900 ring-offset-2'
                                    : 'border-zinc-200 group-hover:border-zinc-400'
                            }`}
                            style={{
                                background: `linear-gradient(135deg, ${palette.primary} 50%, ${palette.accent} 50%)`,
                            }}
                        />
                        <span className="text-[10px] font-medium text-site-muted">{palette.name}</span>
                    </button>
                );
            })}
        </div>
    );
}
