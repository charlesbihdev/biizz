import { X } from 'lucide-react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';

interface Props {
    tags: string[];
    error?: string;
    onChange: (tags: string[]) => void;
}

function tokenize(raw: string, existing: string[]): string[] {
    return raw
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 50 && !existing.includes(t));
}

export function ProductTagsField({ tags, error, onChange }: Props) {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    function commit() {
        const newTags = tokenize(input, tags);
        if (newTags.length > 0) {
            onChange([...tags, ...newTags]);
        }
        setInput('');
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit();
        } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    }

    function removeTag(tag: string) {
        onChange(tags.filter((t) => t !== tag));
    }

    return (
        <div className="flex flex-col gap-1.5">
            <Label>Tags</Label>
            <div
                className="flex min-h-10 cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-site-border bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-brand/30"
                onClick={() => inputRef.current?.focus()}
            >
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full border border-site-border bg-site-surface px-2.5 py-0.5 text-xs font-medium text-site-fg"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-site-muted transition hover:text-site-fg"
                            aria-label={`Remove ${tag}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={commit}
                    placeholder={tags.length === 0 ? 'e.g. ebook, Ghana, finance' : ''}
                    className="min-w-24 flex-1 bg-transparent text-sm text-site-fg placeholder:text-site-muted focus:outline-none"
                />
            </div>
            <p className="text-xs text-site-muted">
                Separate tags with commas or press Enter. Used for discovery on the marketplace.
            </p>
            <InputError message={error} />
        </div>
    );
}
