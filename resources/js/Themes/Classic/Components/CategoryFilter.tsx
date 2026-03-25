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

    return (
        <div className="border-b border-zinc-100 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex gap-1 overflow-x-auto py-3 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
                    {/* All pill */}
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition"
                        style={
                            activeSlug === null
                                ? { backgroundColor: accent, color: '#fff' }
                                : { backgroundColor: '#f4f4f5', color: '#52525b' }
                        }
                    >
                        All
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => onChange(cat.slug)}
                            className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition"
                            style={
                                activeSlug === cat.slug
                                    ? { backgroundColor: accent, color: '#fff' }
                                    : { backgroundColor: '#f4f4f5', color: '#52525b' }
                            }
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
