import { Label } from '@/components/ui/label';
import { DIGITAL_CATEGORIES, type DigitalCategory } from '@/data/digital-categories';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export function DigitalCategoryField({ value, onChange }: Props) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor="digital_category">Category</Label>
            <select
                id="digital_category"
                value={value || 'others'}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            >
                {DIGITAL_CATEGORIES.map((cat: DigitalCategory) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
        </div>
    );
}
