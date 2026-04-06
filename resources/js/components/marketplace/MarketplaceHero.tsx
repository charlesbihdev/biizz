import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useRef, useState } from 'react';
import { index } from '@/routes/marketplace';

interface Props {
    initialSearch?: string;
    total: number;
}

export default function MarketplaceHero({ initialSearch = '', total }: Props) {
    const [query, setQuery] = useState(initialSearch);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(index().url, { ...(query ? { search: query } : {}) }, {
            preserveState:  true,
            preserveScroll: false,
            only:           ['products', 'activeFilters'],
        });
    }

    return (
        <div className="border-b border-site-border bg-white px-5 py-10">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: title + count */}
                    <div>
                        <h1 className="text-xl font-bold text-site-fg sm:text-2xl">
                            Marketplace
                        </h1>
                        <p className="mt-0.5 text-sm text-site-muted">
                            {total > 0
                                ? `${total.toLocaleString()} digital ${total === 1 ? 'product' : 'products'} from African creators`
                                : 'Digital products from African creators'
                            }
                        </p>
                    </div>

                    {/* Right: search */}
                    <form
                        onSubmit={handleSearch}
                        className="flex w-full items-center gap-2 rounded-xl border border-site-border bg-site-bg px-3.5 py-2.5 focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10 sm:w-72"
                    >
                        <Search className="h-4 w-4 shrink-0 text-site-muted" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search products, creators..."
                            className="flex-1 bg-transparent text-sm text-site-fg placeholder:text-site-muted focus:outline-none"
                        />
                        {query && (
                            <button
                                type="submit"
                                className="shrink-0 rounded-lg bg-brand px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-hover"
                            >
                                Search
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
