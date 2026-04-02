import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store as storeCategory } from '@/routes/businesses/categories';
import type { Business } from '@/types';

interface Props {
    business: Business;
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onCreated: (name: string) => void;
}

export function QuickAddCategoryDialog({ business, open, onOpenChange, onCreated }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '' });

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const name = data.name.trim();
        post(storeCategory({ business: business.slug }).url, {
            preserveState: true,
            preserveScroll: true,
            only: ['categories', 'errors', 'flash'],
            onSuccess: () => {
                onCreated(name);
                reset();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>New category</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="quick-cat-name">Name</Label>
                        <Input
                            id="quick-cat-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Dresses"
                            autoFocus
                            required
                            className="border-site-border focus-visible:ring-brand/30"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <button
                        type="submit"
                        disabled={processing || !data.name.trim()}
                        className="flex items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                    >
                        {processing && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
                        Create category
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
