interface Category {
    id:   number;
    name: string;
    slug: string;
}

import { useState } from 'react';

interface Category {
    id:   number;
    name: string;
    slug: string;
}

interface Props {
    categories:   Category[];
    activeSlug:   string | null;
    onChange:     (slug: string | null) => void;
    accentColor?: string;
}

export default function CategoryFilter({ categories, activeSlug, onChange, accentColor }: Props) {
    if (categories.length === 0) { return null; }

    const accent = accentColor ?? '#1a1a1a';
    const [hoveredSlug, setHoveredSlug] = useState<string | 'all' | null>(null);

    const pillStyle = (slug: string | null) => {
        const key = slug ?? 'all';
        const isActive  = activeSlug === slug;
        const isHovered = hoveredSlug === key;
        if (isActive)  { return { backgroundColor: accent, color: '#fff' }; }
        if (isHovered) { return { backgroundColor: accent + '22', color: accent }; }
        return { backgroundColor: '#f4f4f5', color: '#52525b' };
    };

    return (
        <div className="border-b border-zinc-100 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex gap-1 overflow-x-auto py-3 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        onMouseEnter={() => setHoveredSlug('all')}
                        onMouseLeave={() => setHoveredSlug(null)}
                        className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition"
                        style={pillStyle(null)}
                    >
                        All
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => onChange(cat.slug)}
                            onMouseEnter={() => setHoveredSlug(cat.slug)}
                            onMouseLeave={() => setHoveredSlug(null)}
                            className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition"
                            style={pillStyle(cat.slug)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
