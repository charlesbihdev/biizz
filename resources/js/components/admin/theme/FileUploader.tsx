import { useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { store as mediaStore } from '@/routes/businesses/media';
import type { Business } from '@/types';

type Props = {
    business: Business;
    value?: string;
    dimensions?: string;
    onChange: (url: string) => void;
};

export function FileUploader({ business, value, dimensions, onChange }: Props) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setError(null);
        setUploading(true);

        const form = new FormData();
        form.append('file', file);

        try {
            const res = await fetch(mediaStore({ business: business.slug }).url, {
                method: 'POST',
                body: form,
                headers: {
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)
                            ?.content ?? '',
                },
            });

            if (!res.ok) {
                throw new Error('Upload failed');
            }

            const { url } = (await res.json()) as { url: string };
            onChange(url);
        } catch {
            setError('Upload failed. Try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {value ? (
                <div className="relative overflow-hidden rounded-lg border border-site-border">
                    <img src={value} alt="Uploaded" className="h-32 w-full object-cover" />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-site-border bg-site-surface text-sm text-site-muted transition hover:border-brand hover:text-brand disabled:opacity-50"
                >
                    {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <Upload className="h-5 w-5" />
                            <span>Click to upload</span>
                            {dimensions && (
                                <span className="text-xs opacity-60">{dimensions}px</span>
                            )}
                        </>
                    )}
                </button>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        void handleFile(file);
                    }
                }}
            />
        </div>
    );
}
