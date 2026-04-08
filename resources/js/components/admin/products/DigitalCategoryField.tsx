import { Label } from '@/components/ui/label';
import { DIGITAL_CATEGORIES, type DigitalCategory } from '@/data/digital-categories';
import InputError from '@/components/input-error';

interface Props {
    value: string;
    error?: string;
    onChange: (value: string) => void;
}

export function DigitalCategoryField({ value, error, onChange }: Props) {
    // If the value isn't in the list (e.g., an old database value like 'ebook'), 
    // it forces the user to actively select a new valid one.
    const isValid = DIGITAL_CATEGORIES.includes(value as DigitalCategory);
    const displayValue = isValid ? value : '';

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor="digital_category">Category <span className="text-red-500">*</span></Label>
            <select
                id="digital_category"
                value={displayValue}
                onChange={(e) => onChange(e.target.value)}
                required
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${error ? 'border-red-500 shadow-sm' : 'border-site-border'}`}
            >
                {!isValid && (
                    <option value="" disabled>Select a category...</option>
                )}
                {DIGITAL_CATEGORIES.map((cat: DigitalCategory) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            <InputError message={error} />
        </div>
    );
}
