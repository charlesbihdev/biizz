import { router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSearchOptions {
    /** Debounce delay in ms for auto-search. 0 = no auto-search (submit only). Default: 0 */
    debounce?: number;
    /**
     * Target URL to navigate to with the search query.
     * - `undefined` / `'current'` (default): stays on the current page and appends ?q=
     * - `string`: navigates to the given URL with ?q=
     *
     * Themes with a dedicated shop page can pass `shop.url(slug)` explicitly.
     */
    target?: string;
}

interface UseSearchReturn {
    /** Current search query string */
    query: string;
    /** Update the query (controlled input) */
    setQuery: (value: string) => void;
    /** Submit search — navigates to the target with ?q= */
    submit: () => void;
    /** Clear the search query and navigate without ?q */
    clear: () => void;
    /** Form submit handler — call from onSubmit */
    handleSubmit: (e: React.FormEvent) => void;
}

/**
 * Theme-agnostic product search hook.
 *
 * Lives in Shared/Hooks so every theme (Classic, Boutique, future themes)
 * gets identical search behavior without duplicating any logic.
 *
 * Uses Wayfinder for type-safe route generation and Inertia's router
 * for SPA navigation. Themes control where search results appear via
 * the `target` option.
 *
 * Usage (navigate to shop page — default):
 *   const search = useSearch(business.slug);
 *
 * Usage (stay on current page):
 *   const search = useSearch(business.slug, { target: 'current' });
 *
 * Usage (debounced auto-search):
 *   const search = useSearch(business.slug, { debounce: 300 });
 *
 * JSX:
 *   <form onSubmit={search.handleSubmit}>
 *       <input value={search.query} onChange={(e) => search.setQuery(e.target.value)} />
 *   </form>
 */
export function useSearch(slug: string, options: UseSearchOptions = {}): UseSearchReturn {
    const { debounce = 0, target } = options;
    const { url: currentUrl } = usePage();

    const initialQuery = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('q') ?? ''
        : '';

    const [query, setQuery] = useState(initialQuery);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const navigate = useCallback((q: string) => {
        const trimmed = q.trim();

        // Resolve the base URL the search should navigate to
        const baseUrl = target ?? currentUrl.split('?')[0];

        // Preserve existing query params when staying on the same page
        const queryParams: Record<string, string> = {};
        if (currentUrl.split('?')[0] === baseUrl) {
            const current = new URLSearchParams(window.location.search);
            current.forEach((value, key) => {
                if (key !== 'q' && key !== 'page') {
                    queryParams[key] = value;
                }
            });
        }

        if (trimmed) {
            queryParams.q = trimmed;
        }

        const search = new URLSearchParams(queryParams).toString();
        const url = search ? `${baseUrl}?${search}` : baseUrl;

        router.visit(url, { preserveScroll: false });
    }, [slug, currentUrl, target]);

    const submit = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        navigate(query);
    }, [query, navigate]);

    const clear = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setQuery('');
        navigate('');
    }, [navigate]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        submit();
    }, [submit]);

    // Debounced auto-search when enabled
    useEffect(() => {
        if (debounce <= 0) return;
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            navigate(query);
        }, debounce);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [query, debounce, navigate]);

    return { query, setQuery, submit, clear, handleSubmit };
}
