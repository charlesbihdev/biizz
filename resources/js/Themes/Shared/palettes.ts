export interface ColorPalette {
    id:      string;
    name:    string;
    primary: string;
    accent:  string;
}

export const PALETTES: ColorPalette[] = [
    { id: 'midnight', name: 'Midnight', primary: '#111111', accent: '#f59e0b' },
    { id: 'forest',   name: 'Forest',   primary: '#1a3c2e', accent: '#4ade80' },
    { id: 'ocean',    name: 'Ocean',    primary: '#0f2d5e', accent: '#38bdf8' },
    { id: 'crimson',  name: 'Crimson',  primary: '#7f1d1d', accent: '#fca5a5' },
    { id: 'stone',    name: 'Stone',    primary: '#292524', accent: '#d6d3d1' },
];
