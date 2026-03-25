export interface ColorPalette {
    id:      string;
    name:    string;
    primary: string;
    accent:  string;
    bg:      string;
}

export const PALETTES: ColorPalette[] = [
    // ── Original palettes (bg added) ──────────────────────────────────────────
    { id: 'midnight', name: 'Midnight', primary: '#111111', accent: '#f59e0b', bg: '#fffbf0' },
    { id: 'forest',   name: 'Forest',   primary: '#1a3c2e', accent: '#4ade80', bg: '#f0fdf4' },
    { id: 'ocean',    name: 'Ocean',    primary: '#0f2d5e', accent: '#38bdf8', bg: '#f0f9ff' },
    { id: 'crimson',  name: 'Crimson',  primary: '#7f1d1d', accent: '#fca5a5', bg: '#fff1f2' },
    { id: 'stone',    name: 'Stone',    primary: '#292524', accent: '#d6d3d1', bg: '#fafaf9' },

    // ── New palettes ──────────────────────────────────────────────────────────
    { id: 'ember',    name: 'Ember',    primary: '#7c2d12', accent: '#f97316', bg: '#fff7ed' },
    { id: 'plum',     name: 'Plum',     primary: '#3b0764', accent: '#c084fc', bg: '#faf5ff' },
    { id: 'slate',    name: 'Slate',    primary: '#0f172a', accent: '#60a5fa', bg: '#f8fafc' },
    { id: 'rose',     name: 'Rose',     primary: '#881337', accent: '#fb7185', bg: '#fff1f2' },
];
