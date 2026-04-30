import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';
import { DEFAULT_PALETTE, PALETTES } from '@/Themes/Shared/palettes';

interface Props {
    value?:     string; // palette id, or undefined when custom
    primary?:   string;
    highlight?: string;
    surface?:   string;
    onChange:   (primary: string, highlight: string, surface: string, id: string | null) => void;
}

export function PalettePicker({ value, primary: primaryProp, highlight: highlightProp, surface: surfaceProp, onChange }: Props) {
    const [customOpen, setCustomOpen] = useState(false);

    const activePalette   = PALETTES.find((p) => p.id === value);
    const currentPrimary   = primaryProp   ?? activePalette?.primary   ?? DEFAULT_PALETTE.primary;
    const currentHighlight = highlightProp ?? activePalette?.highlight ?? DEFAULT_PALETTE.highlight;
    const currentSurface   = surfaceProp   ?? activePalette?.surface   ?? DEFAULT_PALETTE.surface;

    // "Modified" = a preset is selected but at least one color diverges from its defaults.
    const isModified = !!activePalette && (
        activePalette.primary.toLowerCase()   !== currentPrimary.toLowerCase()
        || activePalette.highlight.toLowerCase() !== currentHighlight.toLowerCase()
        || activePalette.surface.toLowerCase()   !== currentSurface.toLowerCase()
    );

    const handlePaletteClick = (id: string) => {
        const p = PALETTES.find((pal) => pal.id === id)!;
        onChange(p.primary, p.highlight, p.surface, id);
        setCustomOpen(false);
    };

    const handleCustomChange = (slot: 'primary' | 'highlight' | 'surface', hex: string) => {
        const next = {
            primary:   currentPrimary,
            highlight: currentHighlight,
            surface:   currentSurface,
            [slot]:    hex,
        };
        // Keep the preset id so we can show "Luxe (modified)" and offer Reset.
        // Switch to null only if the user has no preset selected to begin with.
        onChange(next.primary, next.highlight, next.surface, value ?? null);
    };

    const handleReset = () => {
        if (!activePalette) { return; }
        onChange(activePalette.primary, activePalette.highlight, activePalette.surface, activePalette.id);
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
                            title={`${palette.name} — like ${palette.reference}`}
                            onClick={() => handlePaletteClick(palette.id)}
                            className={`group flex flex-col items-center gap-1.5 ${isSelected ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                        >
                            <span
                                className={`block h-9 w-9 overflow-hidden rounded-full border-2 transition ${
                                    isSelected
                                        ? 'border-zinc-900 shadow-md ring-2 ring-zinc-900 ring-offset-2'
                                        : 'border-zinc-200 group-hover:border-zinc-400'
                                }`}
                                style={{
                                    background: `linear-gradient(135deg, ${palette.primary} 40%, ${palette.highlight} 40% 70%, ${palette.surface} 70%)`,
                                }}
                            />
                            <span className="text-[10px] font-medium text-site-muted">
                                {palette.name}
                                {isSelected && isModified && <span className="text-site-muted/70"> (modified)</span>}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Active 3-swatch preview ── */}
            <div className="flex gap-2">
                {[
                    { label: 'Primary',   color: currentPrimary   },
                    { label: 'Highlight', color: currentHighlight },
                    { label: 'Surface',   color: currentSurface   },
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

            {/* ── Reset / Customize controls ── */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setCustomOpen((o) => !o)}
                    className="flex items-center gap-1.5 text-xs font-medium text-site-muted hover:text-site-fg"
                >
                    {customOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    Customize colors
                </button>

                {isModified && activePalette && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-1.5 text-xs font-medium text-site-muted transition hover:text-site-fg"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Reset to {activePalette.name}
                    </button>
                )}
            </div>

            {customOpen && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {(
                        [
                            { slot: 'primary'   as const, label: 'Primary',   value: currentPrimary   },
                            { slot: 'highlight' as const, label: 'Highlight', value: currentHighlight },
                            { slot: 'surface'   as const, label: 'Surface',   value: currentSurface   },
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
