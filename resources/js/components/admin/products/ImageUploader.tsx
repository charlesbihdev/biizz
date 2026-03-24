import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, X } from 'lucide-react';
import { store as mediaStore } from '@/routes/businesses/media';

export interface UploadedImage {
    url: string;
    alt?: string;
}

interface Props {
    businessSlug: string;
    images: UploadedImage[];
    onChange: (images: UploadedImage[]) => void;
}

const MAX = 8;

export function ImageUploader({ businessSlug, images, onChange }: Props) {
    const inputRef             = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || images.length >= MAX) { return; }

        setUploading(true);

        const body = new FormData();
        body.append('file', file);

        try {
            const res  = await fetch(mediaStore({ business: businessSlug }).url, {
                method:  'POST',
                headers: { 'X-XSRF-TOKEN': getCsrf() },
                body,
            });
            const json = await res.json() as { url: string };
            onChange([...images, { url: json.url, alt: '' }]);
        } catch {
            // silently ignore — user can retry
        } finally {
            setUploading(false);
            if (inputRef.current) { inputRef.current.value = ''; }
        }
    };

    const remove = (idx: number) => {
        onChange(images.filter((_, i) => i !== idx));
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                {images.map((img, idx) => (
                    <div key={img.url} className="group relative h-20 w-20 shrink-0">
                        <img
                            src={img.url}
                            alt={img.alt || `Image ${idx + 1}`}
                            className="h-full w-full rounded-lg border border-site-border object-cover"
                        />
                        {/* Primary badge */}
                        {idx === 0 && (
                            <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-black/70 px-1 py-0.5 text-[9px] font-semibold text-white">
                                <Star className="h-2.5 w-2.5" /> Main
                            </span>
                        )}
                        {/* Remove button */}
                        <button
                            type="button"
                            onClick={() => remove(idx)}
                            className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow group-hover:flex"
                            aria-label="Remove image"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}

                {/* Add tile */}
                {images.length < MAX && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-site-border text-site-muted transition hover:border-brand hover:text-brand disabled:opacity-60"
                    >
                        {uploading
                            ? <Loader2 className="h-5 w-5 animate-spin" />
                            : <ImagePlus className="h-5 w-5" />
                        }
                        <span className="text-[10px] font-medium">
                            {uploading ? 'Uploading' : 'Add photo'}
                        </span>
                    </button>
                )}
            </div>

            {images.length === MAX && (
                <p className="text-xs text-site-muted">Maximum {MAX} images reached.</p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}

function getCsrf(): string {
    return (document.cookie.match(/XSRF-TOKEN=([^;]+)/) ?? [])[1]
        ? decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) ?? [])[1])
        : '';
}
