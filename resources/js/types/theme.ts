import { ClassicSchema }  from '@/Themes/Classic/schema';
import { BoutiqueSchema } from '@/Themes/Boutique/schema';

/**
 * Master schema map — the Admin Dashboard reads this to auto-generate its UI.
 * Adding a new theme: import its schema here and add one entry. Nothing else changes.
 */
export const SCHEMA_MAP = {
    classic:  ClassicSchema,
    boutique: BoutiqueSchema,
} as const;

export type ThemeId = keyof typeof SCHEMA_MAP;
