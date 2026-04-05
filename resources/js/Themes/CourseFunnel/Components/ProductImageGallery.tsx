import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import type { ProductImage } from '@/types/business';

interface Props {
    images: ProductImage[];
    alt:    string;
    accent: string;
    fill?:  boolean; // stretch to fill parent width (e.g. inside a card)
}

export default function ProductImageGallery({ images, alt, accent, fill = false }: Props) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [zoomed, setZoomed]           = useState(false);

    if (images.length === 0) { return null; }

    const active = images[activeIndex];

    return (
        <>
            <div className="flex flex-col items-center gap-3">
                {/* Main image */}
                <div className={`relative shrink-0 ${fill ? 'w-full' : ''}`}>
                    {!fill && (
                        <div
                            className="pointer-events-none absolute inset-0 rounded-2xl opacity-25 blur-3xl"
                            style={{ background: accent }}
                        />
                    )}
                    <div className="group relative">
                        <img
                            src={active.url}
                            alt={active.alt || alt}
                            className={`relative cursor-zoom-in ${fill ? 'w-full rounded-none' : 'w-55 rounded-2xl shadow-2xl sm:w-65 lg:w-75'}`}
                            style={{ aspectRatio: '3/4', objectFit: 'cover' }}
                            onClick={() => setZoomed(true)}
                        />
                        <div className="pointer-events-none absolute bottom-2.5 right-2.5 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                            <ZoomIn className="h-3.5 w-3.5" />
                        </div>
                    </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                        {images.map((img, i) => (
                            <button
                                key={img.id}
                                type="button"
                                onClick={() => setActiveIndex(i)}
                                className="shrink-0 overflow-hidden rounded-lg border-2 transition-all"
                                style={{
                                    borderColor: i === activeIndex ? accent : 'transparent',
                                    opacity:     i === activeIndex ? 1 : 0.5,
                                }}
                            >
                                <img
                                    src={img.url}
                                    alt={img.alt || alt}
                                    className="h-14 w-10 object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Zoom lightbox */}
            {zoomed && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setZoomed(false)}
                >
                    <button
                        type="button"
                        onClick={() => setZoomed(false)}
                        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <img
                        src={active.url}
                        alt={active.alt || alt}
                        className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Thumbnail strip in lightbox */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                            {images.map((img, i) => (
                                <button
                                    key={img.id}
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                                    className="shrink-0 overflow-hidden rounded-md border-2 transition-all"
                                    style={{
                                        borderColor: i === activeIndex ? 'white' : 'transparent',
                                        opacity:     i === activeIndex ? 1 : 0.5,
                                    }}
                                >
                                    <img
                                        src={img.url}
                                        alt={img.alt || alt}
                                        className="h-12 w-9 object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
