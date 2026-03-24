import { useForm } from '@inertiajs/react';
import { AlertTriangle, LoaderCircle, Package, Zap } from 'lucide-react';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BUSINESS_CATEGORIES } from '@/data/businessCategories';
import { store } from '@/routes/businesses';
import type { BusinessCategory, BusinessType } from '@/types';

function toSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function CreateBusinessModal({ open, onOpenChange }: Props) {
    const { data, setData, submit, processing, errors } = useForm({
        name: '',
        slug: '',
        business_type: 'physical' as BusinessType,
        business_category: '' as BusinessCategory | '',
    });

    const handleNameChange = (value: string) => {
        setData((prev) => ({ ...prev, name: value, slug: toSlug(value) }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Create a business</DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        submit(store());
                    }}
                    className="flex flex-col gap-5 pt-2"
                >
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="b-name">Business name</Label>
                        <Input
                            id="b-name"
                            type="text"
                            value={data.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Zara's Boutique"
                            autoFocus
                            className="border-site-border focus-visible:ring-brand/30"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="b-slug">Business URL</Label>
                        <div className="flex items-center rounded-lg border border-site-border bg-site-surface px-3">
                            <span className="shrink-0 text-sm text-site-muted">biizz.app/s/</span>
                            <Input
                                id="b-slug"
                                type="text"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder="zaras-boutique"
                                className="border-0 bg-transparent px-1 focus-visible:ring-0"
                            />
                        </div>
                        <InputError message={errors.slug} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Business type</Label>
                        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            <p className="text-xs leading-relaxed text-amber-700">
                                <span className="font-semibold">This cannot be changed after creation.</span> Physical
                                stores use your own payment gateway with a monthly subscription. Digital stores use
                                biizz&apos;s gateway with 5% per-sale commission.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {(
                                [
                                    {
                                        value: 'physical',
                                        icon: Package,
                                        title: 'Physical',
                                        desc: 'Goods with stock management. Subscription billing.',
                                    },
                                    {
                                        value: 'digital',
                                        icon: Zap,
                                        title: 'Digital',
                                        desc: 'Files and downloads. 5% per-sale commission.',
                                    },
                                ] as const
                            ).map(({ value, icon: Icon, title, desc }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setData('business_type', value)}
                                    className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition ${
                                        data.business_type === value
                                            ? 'border-brand bg-brand/5 ring-1 ring-brand'
                                            : 'border-site-border hover:border-zinc-400'
                                    }`}
                                >
                                    <Icon
                                        className={`h-5 w-5 ${data.business_type === value ? 'text-brand' : 'text-site-muted'}`}
                                    />
                                    <p className="text-sm font-semibold text-site-fg">{title}</p>
                                    <p className="text-xs leading-relaxed text-site-muted">{desc}</p>
                                </button>
                            ))}
                        </div>
                        <InputError message={errors.business_type} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="business_category">Category</Label>
                        <select
                            id="business_category"
                            value={data.business_category}
                            onChange={(e) => setData('business_category', e.target.value as BusinessCategory | '')}
                            className="w-full rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus:ring-2 focus:ring-brand/30"
                        >
                            <option value="">Select your industry...</option>
                            {BUSINESS_CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.business_category} />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="flex items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create business
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
