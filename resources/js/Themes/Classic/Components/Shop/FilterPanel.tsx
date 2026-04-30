import React from 'react';
import type { SemanticTokens } from '@/Themes/Shared/Tokens';

type Filters = {
    category:  string | null;
    min_price: string | null;
    max_price: string | null;
    in_stock:  boolean;
    sort:      string;
    q:         string | null;
};

interface FilterPanelProps {
    draft:      Filters;
    setDraft:   React.Dispatch<React.SetStateAction<Filters>>;
    categories: { id: number; name: string; slug: string }[];
    priceRange: { min: number; max: number };
    isDigital:  boolean;
    tokens:     SemanticTokens;
    onApply:    () => void;
    onClear:    () => void;
}

export default function FilterPanel({ draft, setDraft, categories, priceRange, isDigital, tokens, onApply, onClear }: FilterPanelProps) {
    const fmt = (n: number) => n.toLocaleString('en-GH', { minimumFractionDigits: 0 });

    return (
        <div className="flex flex-col gap-6">
            {/* Search */}
            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.textMuted }}>Search</p>
                <input
                    type="search"
                    value={draft.q ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value || null }))}
                    placeholder="Search products…"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
            </div>

            {/* Categories */}
            {categories.length > 0 && (
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.textMuted }}>Category</p>
                    <div className="flex flex-col gap-1">
                        <button
                            type="button"
                            onClick={() => setDraft((d) => ({ ...d, category: null }))}
                            className="rounded-lg px-3 py-1.5 text-left text-sm font-medium transition"
                            style={!draft.category
                                ? { color: tokens.ctaBg, backgroundColor: tokens.highlightSoft }
                                : { color: tokens.textMuted }}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setDraft((d) => ({ ...d, category: cat.slug }))}
                                className="rounded-lg px-3 py-1.5 text-left text-sm font-medium transition"
                                style={draft.category === cat.slug
                                    ? { color: tokens.ctaBg, backgroundColor: tokens.highlightSoft }
                                    : { color: tokens.textMuted }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Price range */}
            {priceRange.max > 0 && (
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.textMuted }}>Price (GHS)</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min={0}
                            value={draft.min_price ?? ''}
                            onChange={(e) => setDraft((d) => ({ ...d, min_price: e.target.value || null }))}
                            placeholder={`${fmt(priceRange.min)}`}
                            className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm outline-none focus:border-zinc-400"
                        />
                        <span className="shrink-0 text-xs text-zinc-400">–</span>
                        <input
                            type="number"
                            min={0}
                            value={draft.max_price ?? ''}
                            onChange={(e) => setDraft((d) => ({ ...d, max_price: e.target.value || null }))}
                            placeholder={`${fmt(priceRange.max)}`}
                            className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm outline-none focus:border-zinc-400"
                        />
                    </div>
                </div>
            )}

            {/* In stock */}
            {!isDigital && (
                <div>
                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={draft.in_stock}
                            onChange={(e) => setDraft((d) => ({ ...d, in_stock: e.target.checked }))}
                            className="h-4 w-4 rounded border-zinc-300"
                            style={{ accentColor: tokens.ctaBg }}
                        />
                        <span className="text-sm font-medium" style={{ color: tokens.textPrimary }}>In stock only</span>
                    </label>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={onApply}
                    className="w-full rounded-xl py-2.5 text-sm font-bold transition hover:opacity-90"
                    style={{ backgroundColor: tokens.ctaBg, color: tokens.ctaFg }}
                >
                    Apply filters
                </button>
                <button
                    type="button"
                    onClick={onClear}
                    className="w-full rounded-xl py-2.5 text-sm font-medium transition"
                    style={{ color: tokens.textMuted }}
                >
                    Clear all
                </button>
            </div>
        </div>
    );
}
