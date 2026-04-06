import { Link } from '@inertiajs/react';
import { index } from '@/routes/marketplace';

interface Props {
    description: string | null;
    tags: string[];
}

export default function ProductDescription({ description, tags }: Props) {
    return (
        <div className="flex flex-col gap-6">
            {description && (
                <div
                    className="prose prose-sm max-w-none text-site-fg prose-headings:font-bold prose-headings:text-site-fg prose-p:text-site-muted prose-li:text-site-muted prose-strong:text-site-fg"
                    // Server-sanitized HTML from TipTap editor
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            )}

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Link
                            key={tag}
                            href={index({ tag }).url}
                            className="rounded-full border border-site-border px-3 py-1 text-xs font-medium text-site-muted capitalize transition hover:border-brand hover:text-brand"
                        >
                            {tag}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
