import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRef, useState } from 'react';
import { PALETTES } from '@/Themes/Shared/palettes';

interface Props {
    value?:    string; // palette id, or undefined if custom
    primary?:  string;
    accent?:   string;
    bg?:       string;
    onChange:  (primary: string, accent: string, bg: string, id: string | null) => void;
}

export function PalettePicker({ value, primary: primaryProp, accent: accentProp, bg: bgProp, onChange }: Props) {
    const [customOpen, setCustomOpen] = useState(false);

    // Resolve current values from selected palette or explicit props
    const activePalette = PALETTES.find((p) => p.id === value);
    const currentPrimary = primaryProp ?? activePalette?.primary ?? '#111111';
    const currentAccent  = accentProp  ?? activePalette?.accent  ?? '#f59e0b';
    const currentBg      = bgProp      ?? activePalette?.bg      ?? '#ffffff';

    const handlePaletteClick = (id: string) => {
        const p = PALETTES.find((pal) => pal.id === id)!;
        onChange(p.primary, p.accent, p.bg, id);
        setCustomOpen(false);
    };

    const handleCustomChange = (slot: 'primary' | 'accent' | 'bg', hex: string) => {
        const next = {
            primary: currentPrimary,
            accent:  currentAccent,
            bg:      currentBg,
            [slot]:  hex,
        };
        onChange(next.primary, next.accent, next.bg, null); // null = custom, no palette selected
    };

    return (
        <div className="flex flex-col gap-4">
            {/* ── Palette chips ── */}
            <div className="flex flex-wrap gap-3">
                {PALETTES.map((palette) => {
                    const isSelected = value === palette.id;
                    return (
                        <button
                            key={palette.id}
                            type="button"
                            title={palette.name}
                            onClick={() => handlePaletteClick(palette.id)}
                            className={`group flex flex-col items-center gap-1.5 ${isSelected ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                        >
                            {/* Three-stripe swatch: primary | accent | bg */}
                            <span
                                className={`block h-9 w-9 overflow-hidden rounded-full border-2 transition ${
                                    isSelected
                                        ? 'border-zinc-900 shadow-md ring-2 ring-zinc-900 ring-offset-2'
                                        : 'border-zinc-200 group-hover:border-zinc-400'
                                }`}
                                style={{
                                    background: `linear-gradient(135deg, ${palette.primary} 40%, ${palette.accent} 40% 70%, ${palette.bg} 70%)`,
                                }}
                            />
                            <span className="text-[10px] font-medium text-site-muted">{palette.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Active 3-swatch preview ── */}
            <div className="flex gap-2">
                {[
                    { label: 'Primary', color: currentPrimary },
                    { label: 'Accent',  color: currentAccent  },
                    { label: 'BG',      color: currentBg      },
                ].map(({ label, color }) => (
                    <div key={label} className="flex flex-1 flex-col items-center gap-1">
                        <span
                            className="block h-7 w-full rounded-md border border-zinc-200"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-[10px] text-site-muted">{label}</span>
                    </div>
                ))}
            </div>

            {/* ── Customize toggle ── */}
            <div>
                <button
                    type="button"
                    onClick={() => setCustomOpen((o) => !o)}
                    className="flex items-center gap-1.5 text-xs font-medium text-site-muted hover:text-site-fg"
                >
                    {customOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    Customize colors
                </button>

                {customOpen && (
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {(
                            [
                                { slot: 'primary' as const, label: 'Primary', value: currentPrimary },
                                { slot: 'accent'  as const, label: 'Accent',  value: currentAccent  },
                                { slot: 'bg'      as const, label: 'BG',      value: currentBg      },
                            ]
                        ).map(({ slot, label, value: hex }) => (
                            <CustomColorSlot
                                key={slot}
                                label={label}
                                value={hex}
                                onChange={(v) => handleCustomChange(slot, v)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function CustomColorSlot({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-site-fg">{label}</span>
            <div className="flex items-center gap-2 rounded-lg border border-site-border px-2 py-1.5">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="h-5 w-5 shrink-0 rounded border border-zinc-200"
                    style={{ backgroundColor: value }}
                    aria-label={`Pick ${label} color`}
                />
                <input
                    ref={inputRef}
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="sr-only"
                    tabIndex={-1}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) { onChange(e.target.value); } }}
                    maxLength={7}
                    className="w-full bg-transparent text-xs text-site-fg outline-none"
                    placeholder="#000000"
                />
            </div>
        </div>
    );
}
