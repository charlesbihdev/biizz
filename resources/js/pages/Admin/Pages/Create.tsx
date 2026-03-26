import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { prepareTiptapContent } from '@/lib/tiptap-uploader';
import { RichDescriptionEditor } from '@/components/admin/products/RichDescriptionEditor';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { create, index, store } from '@/routes/businesses/pages';
import type { Business, PageType } from '@/types';

const PAGE_TYPES: { value: PageType | ''; label: string }[] = [
    { value: '',               label: 'Custom' },
    { value: 'about',          label: 'About Us' },
    { value: 'privacy_policy', label: 'Privacy Policy' },
    { value: 'terms',          label: 'Terms & Conditions' },
    { value: 'faq',            label: 'FAQ' },
    { value: 'shipping',       label: 'Shipping & Returns' },
    { value: 'acceptable_use', label: 'Acceptable Use' },
];

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s]+/g, '-')
        .replace(/-+/g, '-');
}

type FormData = {
    title:        string;
    slug:         string;
    type:         PageType | '';
    content:      string;
    is_published: boolean;
    images?:      File[];
};

type Props = {
    business: Business;
};

export default function CreatePage({ business }: Props) {
    const b = { business: business.slug };
    const finalContentRef = useRef<string | null>(null);
    const imagesRef = useRef<File[]>([]);

    const { data, setData, post, processing, errors, transform } = useForm<FormData>({
        title:        '',
        slug:         '',
        type:         '',
        content:      '',
        is_published: false,
        images:       [],
    });

    transform((data) => ({
        ...data,
        content: finalContentRef.current ?? data.content,
        images:  imagesRef.current.length > 0 ? imagesRef.current : undefined,
    }));

    useEffect(() => {
        setData('slug', slugify(data.title));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.title]);

    const [isFinalizing, setIsFinalizing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsFinalizing(true);
        try {
            // Prepare Tiptap content for transactional upload
            const { content, files } = prepareTiptapContent(data.content);
            finalContentRef.current = content;
            imagesRef.current = files;
            
            post(store(b).url, { 
                preserveScroll: true, 
                preserveState: true 
            });
        } finally {
            setIsFinalizing(false);
        }
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: show(b).url },
                { title: 'Pages',       href: index(b).url },
                { title: 'New page',    href: create(b).url },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-site-fg">New page</h1>
                    <p className="mt-1 text-sm text-site-muted">Add a custom page to {business.name}.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                    {/* ── Left: content ── */}
                    <div className="flex flex-1 flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. Privacy Policy"
                                autoFocus
                                className="border-site-border focus-visible:ring-brand/30"
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="slug">Slug</Label>
                                <span className="text-xs text-site-muted">
                                    /s/{business.slug}/pages/<strong>{data.slug || '…'}</strong>
                                </span>
                            </div>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder="privacy-policy"
                                className="border-site-border font-mono text-sm focus-visible:ring-brand/30"
                            />
                            <InputError message={errors.slug} />
                        </div>

                        <RichDescriptionEditor
                            label="Content"
                            onClear={() => setData('content', '')}
                            value={data.content}
                            onChange={(html) => setData('content', html)}
                            placeholder="Write your page content here..."
                        />
                        <InputError message={errors.content} />
                    </div>

                    {/* ── Right: sidebar ── */}
                    <div className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
                        <div className="rounded-2xl border border-site-border bg-white p-4">
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.is_published}
                                    onChange={(e) => setData('is_published', e.target.checked)}
                                    className="h-4 w-4 rounded border-site-border accent-brand"
                                />
                                <div>
                                    <p className="text-sm font-medium text-site-fg">Published</p>
                                    <p className="text-xs text-site-muted">Visible to customers on your storefront</p>
                                </div>
                            </label>
                        </div>

                        <div className="flex flex-col gap-4 rounded-2xl border border-site-border bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-site-muted">Page type</p>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="type">Type</Label>
                                <select
                                    id="type"
                                    value={(data.type ?? '') as string}
                                    onChange={(e) => setData('type', e.target.value as PageType | '')}
                                    className="w-full rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                                >
                                    {PAGE_TYPES.map((t) => (
                                        <option key={String(t.value)} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                                <InputError message={errors.type} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing || isFinalizing}
                            className="flex items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                        >
                            {(processing || isFinalizing) && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Save page
                        </button>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
