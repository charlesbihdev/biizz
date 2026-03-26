import { SimpleEditor } from '@/components/tiptap/templates/simple/simple-editor';
import { Label } from '@/components/ui/label';

interface Props {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    label?: string;
    onClear?: () => void;
    businessSlug?: string;
}

export function RichDescriptionEditor({ value, onChange, placeholder, label, onClear, businessSlug }: Props) {
    return (
        <div className="flex flex-col gap-2">
            {(label || onClear) && (
                <div className="flex items-center justify-between px-1">
                    {label && <Label className="text-sm font-medium text-site-fg">{label}</Label>}
                    {onClear && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-xs font-medium text-site-muted hover:text-red-500 transition-colors underline decoration-dotted capitalize"
                        >
                            Reset content
                        </button>
                    )}
                </div>
            )}
            
            <SimpleEditor 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder} 
                businessSlug={businessSlug}
            />
        </div>
    );
}
