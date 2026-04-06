import { useRef, useState } from 'react';
import { Link2, Upload, X } from 'lucide-react';

/** Converts any YouTube URL variant to its embed form. Non-YouTube URLs pass through. */
function toEmbedUrl(url: string): string {
    // youtube.com/watch?v=ID or youtube.com/watch?v=ID&...
    const watchMatch = url.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

    // youtu.be/ID
    const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

    // Already an embed URL or other iframe-compatible URL
    return url;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

type Tab = 'upload' | 'embed';

type Props = {
    value?: string;
    onChange: (url: string) => void;
};

export function VideoEmbedField({ value, onChange }: Props) {
    const [tab, setTab]           = useState<Tab>('upload');
    const [preview, setPreview]   = useState<string | null>(null);
    const [embedUrl, setEmbedUrl] = useState(value ?? '');
    const [error, setError]       = useState<string | null>(null);
    const inputRef                = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) { return; }

        if (file.size > MAX_SIZE_BYTES) {
            setError('File is too large. Maximum size is 10 MB.');
            return;
        }

        setError(null);

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        onChange(objectUrl);
    };

    const handleRemoveUpload = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
            setPreview(null);
        }
        if (inputRef.current) { inputRef.current.value = ''; }
        onChange('');
    };

    const handleEmbedChange = (url: string) => {
        setEmbedUrl(url);
        onChange(url);
    };

    const tabClass = (t: Tab) =>
        `px-4 py-2 text-sm font-medium transition border-b-2 ${
            tab === t
                ? 'border-brand text-brand'
                : 'border-transparent text-site-muted hover:text-site-fg'
        }`;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex border-b border-site-border">
                <button type="button" className={tabClass('upload')} onClick={() => setTab('upload')}>
                    <span className="flex items-center gap-1.5">
                        <Upload className="h-3.5 w-3.5" />
                        Upload video
                    </span>
                </button>
                <button type="button" className={tabClass('embed')} onClick={() => setTab('embed')}>
                    <span className="flex items-center gap-1.5">
                        <Link2 className="h-3.5 w-3.5" />
                        Embed URL
                    </span>
                </button>
            </div>

            {tab === 'upload' && (
                <div className="flex flex-col gap-2">
                    {preview ? (
                        <div className="relative overflow-hidden rounded-xl border border-site-border bg-black">
                            <video
                                src={preview}
                                controls
                                className="aspect-video w-full rounded-xl object-contain"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveUpload}
                                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-site-border bg-site-surface text-sm text-site-muted transition hover:border-brand hover:text-brand"
                        >
                            <Upload className="h-6 w-6" />
                            <span className="font-medium">Click to upload</span>
                            <span className="text-xs opacity-60">MP4 or WebM, max 10 MB</span>
                        </button>
                    )}

                    {error && (
                        <p className="text-xs text-red-500">{error}</p>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        accept="video/mp4,video/webm"
                        className="hidden"
                        onChange={handleFile}
                    />
                </div>
            )}

            {tab === 'embed' && (
                <div className="flex flex-col gap-3">
                    <input
                        type="url"
                        value={embedUrl}
                        onChange={(e) => handleEmbedChange(e.target.value)}
                        placeholder="https://www.youtube.com/embed/..."
                        className="rounded-lg border border-site-border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                    />

                    {embedUrl && (
                        <div className="overflow-hidden rounded-xl border border-site-border">
                            <div className="aspect-video">
                                <iframe
                                    src={toEmbedUrl(embedUrl)}
                                    className="h-full w-full"
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                />
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-site-muted">
                        Paste any YouTube link — watch or share URL. Other iframe-compatible URLs also work.
                    </p>
                </div>
            )}
        </div>
    );
}
