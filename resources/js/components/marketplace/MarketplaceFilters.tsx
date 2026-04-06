import { router } from '@inertiajs/react';
import { DIGITAL_CATEGORIES } from '@/data/digital-categories';
import { index } from '@/routes/marketplace';

interface Props {
    activeCategory?: string;
    activeSearch?:   string;
}

export default function MarketplaceFilters({ activeCategory, activeSearch }: Props) {
    const navigate = (category?: string) => {
        const params: Record<string, string> = {};
        if (activeSearch) params.search = activeSearch;
        if (category)     params.category = category;

        router.get(index().url, params, {
            preserveState:  true,
            preserveScroll: true,
            only:           ['products', 'activeFilters'],
        });
    };

    return (
        <div className="border-b border-site-border bg-site-bg">
            <div className="mx-auto max-w-6xl px-5 py-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                        type="button"
                        onClick={() => navigate()}
                        className={[
                            'shrink-0 rounded-full border px-3.5 py-1 text-xs font-medium transition',
                            !activeCategory
                                ? 'border-brand bg-brand text-white'
                                : 'border-site-border text-site-muted hover:border-brand/50 hover:text-site-fg',
                        ].join(' ')}
                    >
                        All
                    </button>

                    {DIGITAL_CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => navigate(cat)}
                            className={[
                                'shrink-0 rounded-full border px-3.5 py-1 text-xs font-medium transition',
                                activeCategory === cat
                                    ? 'border-brand bg-brand text-white'
                                    : 'border-site-border text-site-muted hover:border-brand/50 hover:text-site-fg',
                            ].join(' ')}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
