import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { ThemeSettings } from '@/types';

type Props = {
    slug: string;
    settings: ThemeSettings;
};

function buildPreviewUrl(slug: string, settings: ThemeSettings): string {
    const params = new URLSearchParams();

    Object.entries(settings).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
        }
    });

    const query = params.toString();

    return `/s/${slug}/preview${query ? `?${query}` : ''}`;
}

export function LivePreview({ slug, settings }: Props) {
    const [src, setSrc] = useState(() => buildPreviewUrl(slug, settings));
    const [loading, setLoading] = useState(true);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            setSrc(buildPreviewUrl(slug, settings));
        }, 400);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [slug, settings]);

    return (
        <div className="relative h-full w-full overflow-hidden rounded-xl border border-site-border bg-site-surface">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-site-surface">
                    <Loader2 className="h-5 w-5 animate-spin text-site-muted" />
                </div>
            )}
            <iframe
                key={src}
                src={src}
                title="Store preview"
                className="h-full w-full"
                onLoad={() => setLoading(false)}
            />
        </div>
    );
}
