import { router, useForm } from '@inertiajs/react';
import { FolderOpen, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { destroy, index, store, update } from '@/routes/businesses/categories';
import type { Business } from '@/types';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    products_count: number;
};

type Props = {
    business: Business;
    categories: Category[];
};

function CategoryFormDialog({
    business,
    category,
    open,
    onOpenChange,
}: {
    business: Business;
    category?: Category;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const b = { business: business.slug };
    const isEdit = !!category;

    const { data, setData, post, processing, errors, reset } = useForm({
        _method:     (isEdit ? 'patch' : '') as string,
        name:        category?.name ?? '',
        description: category?.description ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            preserveState:  true,
            forceFormData:  true,
            onSuccess: () => { reset(); onOpenChange(false); },
        };
        const url = isEdit ? update({ ...b, category: category.id }).url : store(b).url;
        post(url, options);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { reset(); } }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit category' : 'New category'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="cat-name">Name</Label>
                        <Input
                            id="cat-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Dresses"
                            autoFocus
                            className="border-site-border focus-visible:ring-brand/30"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="cat-desc">Description <span className="text-site-muted">(optional)</span></Label>
                        <Input
                            id="cat-desc"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Brief description of this category"
                            className="border-site-border focus-visible:ring-brand/30"
                        />
                        <InputError message={errors.description} />
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                    >
                        {processing && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
                        {isEdit ? 'Save changes' : 'Create category'}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function CategoriesIndex({ business, categories }: Props) {
    const b = { business: business.slug };
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        if (!deleteTarget) { return; }
        setDeleting(true);
        router.visit(destroy({ ...b, category: deleteTarget.id }).url, {
            method: 'delete',
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: show(b).url },
                { title: 'Categories', href: index(b).url },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-site-fg">Categories</h1>
                        <p className="mt-0.5 text-sm text-site-muted">{categories.length} total</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setAddOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-hover"
                    >
                        <Plus className="h-4 w-4" />
                        New category
                    </button>
                </div>

                {categories.length === 0 ? (
                    <div className="rounded-2xl border border-site-border bg-site-surface p-12 text-center">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dim">
                            <FolderOpen className="h-5 w-5 text-brand" />
                        </div>
                        <p className="text-sm font-medium text-site-fg">No categories yet</p>
                        <p className="mt-1 text-xs text-site-muted">
                            Group your products into categories to help customers browse faster.
                        </p>
                        <button
                            type="button"
                            onClick={() => setAddOpen(true)}
                            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                        >
                            <Plus className="h-4 w-4" /> New category
                        </button>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-site-border bg-white">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-site-border bg-site-surface">
                                    <th className="py-2.5 pl-4 pr-3 text-xs font-semibold uppercase tracking-wide text-site-muted">Category</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Products</th>
                                    <th className="py-2.5 pl-3 pr-4" />
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="border-b border-site-border last:border-0 hover:bg-site-surface/50">
                                        <td className="py-3 pl-4 pr-3">
                                            <p className="text-sm font-medium text-site-fg">{cat.name}</p>
                                            {cat.description && (
                                                <p className="mt-0.5 text-xs text-site-muted">{cat.description}</p>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-site-muted">{cat.products_count}</td>
                                        <td className="py-3 pl-3 pr-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditTarget(cat)}
                                                    className="rounded-lg p-1.5 text-site-muted transition hover:bg-site-surface hover:text-site-fg"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(cat)}
                                                    className="rounded-lg p-1.5 text-site-muted transition hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create modal */}
            <CategoryFormDialog
                business={business}
                open={addOpen}
                onOpenChange={setAddOpen}
            />

            {/* Edit modal */}
            {editTarget && (
                <CategoryFormDialog
                    business={business}
                    category={editTarget}
                    open={!!editTarget}
                    onOpenChange={(v) => { if (!v) { setEditTarget(null); } }}
                />
            )}

            {/* Delete dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) { setDeleteTarget(null); } }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Products in this category will become uncategorised. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 disabled:opacity-60"
                        >
                            {deleting && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppSidebarLayout>
    );
}
