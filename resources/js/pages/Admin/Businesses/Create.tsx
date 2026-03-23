import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { index, store } from '@/routes/businesses';

function toSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function CreateBusiness() {
    const { data, setData, submit, processing, errors } = useForm({
        name: '',
        slug: '',
    });

    const handleNameChange = (value: string) => {
        setData((prev) => ({
            ...prev,
            name: value,
            slug: toSlug(value),
        }));
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Businesses', href: index().url },
                { title: 'Create business', href: '#' },
            ]}
        >
            <div className="mx-auto max-w-lg p-6 lg:p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-site-fg">Create a business</h1>
                    <p className="mt-1 text-sm text-site-muted">
                        Give your business a name — you can customise it later.
                    </p>
                </div>

                <form
                    onSubmit={(e) => { e.preventDefault(); submit(store()); }}
                    className="flex flex-col gap-6"
                >
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">Business name</Label>
                        <Input
                            id="name"
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
                        <Label htmlFor="slug">Business URL</Label>
                        <div className="flex items-center rounded-lg border border-site-border bg-site-surface px-3">
                            <span className="shrink-0 text-sm text-site-muted">biizz.app/s/</span>
                            <Input
                                id="slug"
                                type="text"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder="zaras-boutique"
                                className="border-0 bg-transparent px-1 focus-visible:ring-0"
                            />
                        </div>
                        <p className="text-xs text-site-muted">
                            Leave blank to auto-generate from name.
                        </p>
                        <InputError message={errors.slug} />
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
            </div>
        </AppSidebarLayout>
    );
}
