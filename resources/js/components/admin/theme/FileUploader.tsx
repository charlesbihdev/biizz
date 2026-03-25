import { useEffect, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import type { Business } from '@/types';

type Props = {
    business: Business;
    value?: string;
    dimensions?: string;
    onChange: (file: File | null) => void;
};

export function FileUploader({ value, dimensions, onChange }: Props) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) { return; }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        onChange(file);
    };

    const handleRemove = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (inputRef.current) { inputRef.current.value = ''; }
        onChange(null);
    };

    const displayUrl = previewUrl ?? value ?? null;

    return (
        <div className="flex flex-col gap-2">
            {displayUrl ? (
                <div className="relative overflow-hidden rounded-lg border border-site-border">
                    <img src={displayUrl} alt="Uploaded" className="h-32 w-full object-cover" />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-site-border bg-site-surface text-sm text-site-muted transition hover:border-brand hover:text-brand"
                >
                    <Upload className="h-5 w-5" />
                    <span>Click to upload</span>
                    {dimensions && (
                        <span className="text-xs opacity-60">{dimensions}px</span>
                    )}
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
            />
        </div>
    );
}
