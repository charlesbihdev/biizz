import { useState } from 'react';
import type { ProductImage } from '@/types';

interface Props {
    images: ProductImage[];
    productName: string;
}

export default function ProductGallery({ images, productName }: Props) {
    const [active, setActive] = useState(0);

    if (images.length === 0) {
        return (
            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-site-border bg-site-surface">
                <p className="text-sm text-site-muted">No cover image</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-2xl border border-site-border bg-site-surface">
                <img
                    src={images[active].url}
                    alt={images[active].alt ?? productName}
                    className="aspect-[4/3] w-full object-cover"
                />
            </div>

            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                        <button
                            key={img.id}
                            type="button"
                            onClick={() => setActive(i)}
                            className={[
                                'h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition',
                                i === active
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
                    ))}
                </div>
            )}
        </div>
    );
}
