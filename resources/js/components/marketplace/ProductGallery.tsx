import { Play } from 'lucide-react';
import { useState } from 'react';
import type { ProductImage } from '@/types';

interface Props {
    images: ProductImage[];
    productName: string;
    promoVideo?: string | null;
}

function toEmbedUrl(url: string): string | null {
    try {
        const u = new URL(url);
        // youtube.com/watch?v=ID
        if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
            return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
        }
        // youtu.be/ID
        if (u.hostname === 'youtu.be') {
            return `https://www.youtube.com/embed${u.pathname}`;
        }
        // youtube.com/shorts/ID
        if (u.hostname.includes('youtube.com') && u.pathname.startsWith('/shorts/')) {
            return `https://www.youtube.com/embed${u.pathname.replace('/shorts', '')}`;
        }
        // vimeo.com/ID
        if (u.hostname.includes('vimeo.com')) {
            const id = u.pathname.replace(/\D/g, '');
            return `https://player.vimeo.com/video/${id}`;
        }
        // direct video file — not an embed, return as-is marker
        return url;
    } catch {
        return null;
    }
}

function isEmbedUrl(url: string): boolean {
    return url.includes('youtube.com/embed') || url.includes('player.vimeo.com');
}

export default function ProductGallery({ images, productName, promoVideo }: Props) {
    const hasVideo = !!promoVideo;
    // 0 = video (if exists), 1..n = images
    const [active, setActive] = useState(0);

    const totalItems = (hasVideo ? 1 : 0) + images.length;

    if (totalItems === 0) {
        return (
            <div className="flex aspect-4/3 items-center justify-center rounded-2xl border border-site-border bg-site-surface">
                <p className="text-sm text-site-muted">No cover image</p>
            </div>
        );
    }

    const embedUrl = hasVideo ? toEmbedUrl(promoVideo!) : null;
    const isImage = !hasVideo || active > 0;
    const imageIndex = hasVideo ? active - 1 : active;

    return (
        <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-2xl border border-site-border bg-site-surface">
                {!isImage && embedUrl ? (
                    isEmbedUrl(embedUrl) ? (
                        <iframe
                            src={`${embedUrl}?autoplay=0&rel=0`}
                            title={productName}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="aspect-4/3 w-full"
                        />
                    ) : (
                        // Direct video file
                        <video
                            src={embedUrl}
                            controls
                            className="aspect-4/3 w-full object-cover"
                        />
                    )
                ) : images[imageIndex] ? (
                    <img
                        src={images[imageIndex].url}
                        alt={images[imageIndex].alt ?? productName}
                        className="aspect-4/3 w-full object-cover"
                    />
                ) : null}
            </div>

            {totalItems > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {/* Video thumbnail */}
                    {hasVideo && (
                        <button
                            type="button"
                            onClick={() => setActive(0)}
                            className={[
                                'relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition bg-zinc-900',
                                active === 0
                                    ? 'border-brand'
                                    : 'border-site-border opacity-60 hover:opacity-100',
                            ].join(' ')}
                        >
                            <Play className="absolute inset-0 m-auto h-5 w-5 text-white" />
                        </button>
                    )}
                    {/* Image thumbnails */}
                    {images.map((img, i) => {
                        const idx = hasVideo ? i + 1 : i;
                        return (
                            <button
                                key={img.id}
                                type="button"
                                onClick={() => setActive(idx)}
                                className={[
                                    'h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition',
                                    active === idx
                                        ? 'border-brand'
                                        : 'border-site-border opacity-60 hover:opacity-100',
                                ].join(' ')}
                            >
                                <img
                                    src={img.url}
                                    alt={img.alt ?? `Image ${i + 1}`}
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
