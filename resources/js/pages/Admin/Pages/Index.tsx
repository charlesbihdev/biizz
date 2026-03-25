import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, EyeOff, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { create, destroy, index, publish } from '@/routes/businesses/pages';
import type { Business, Page, PageType } from '@/types';

const PAGE_LABELS: Record<NonNullable<PageType>, string> = {
    about:          'About Us',
    privacy_policy: 'Privacy Policy',
    terms:          'Terms & Conditions',
    faq:            'FAQ',
    shipping:       'Shipping & Returns',
    acceptable_use: 'Acceptable Use',
};

type Props = {
    business: Business;
    pages:    Page[];
};

export default function PagesIndex({ business, pages }: Props) {
    const b = { business: business.slug };
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleTogglePublish = (page: Page) => {
        setTogglingId(page.id);
        router.patch(publish({ ...b, page: page.id }).url, {}, {
            preserveScroll: true,
            onFinish: () => setTogglingId(null),
        });
    };

    const handleDelete = (page: Page) => {
        if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) { return; }
        setDeletingId(page.id);
        router.delete(destroy({ ...b, page: page.id }).url, {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: show(b).url },
                { title: 'Pages', href: index(b).url },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-site-fg">Pages</h1>
                        <p className="mt-0.5 text-sm text-site-muted">{pages.length} page{pages.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link
                        href={create(b).url}
                        className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-hover"
                    >
                        <Plus className="h-4 w-4" />
                        New page
                    </Link>
                </div>

                {pages.length === 0 ? (
                    <div className="rounded-2xl border border-site-border bg-site-surface p-12 text-center">
                        <p className="text-sm font-medium text-site-fg">No pages yet</p>
                        <p className="mt-1 text-xs text-site-muted">
                            Create pages like Privacy Policy, FAQ, or About Us.
                        </p>
                        <Link
                            href={create(b).url}
                            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                        >
                            <Plus className="h-4 w-4" /> New page
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-site-border bg-white">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-site-border bg-site-surface">
                                    <th className="py-2.5 pl-4 pr-3 text-xs font-semibold uppercase tracking-wide text-site-muted">Title</th>
                                    <th className="hidden px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted sm:table-cell">Type</th>
                                    <th className="hidden px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted md:table-cell">Slug</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Status</th>
                                    <th className="py-2.5 pl-3 pr-4" />
                                </tr>
                            </thead>
                            <tbody>
                                {pages.map((page) => (
                                    <tr key={page.id} className="border-b border-site-border last:border-0 hover:bg-site-surface/50">
                                        <td className="py-3 pl-4 pr-3">
                                            <p className="text-sm font-medium text-site-fg">{page.title}</p>
                                        </td>
                                        <td className="hidden px-3 py-3 sm:table-cell">
                                            <span className="text-sm text-site-muted">
                                                {page.type ? (PAGE_LABELS[page.type] ?? page.type) : 'Custom'}
                                            </span>
                                        </td>
                                        <td className="hidden px-3 py-3 md:table-cell">
                                            <code className="rounded bg-site-surface px-1.5 py-0.5 text-xs text-site-muted">
                                                {page.slug}
                                            </code>
                                        </td>
                                        <td className="px-3 py-3">
                                            <button
                                                onClick={() => handleTogglePublish(page)}
                                                disabled={togglingId === page.id}
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition disabled:opacity-60 ${
                                                    page.is_published
                                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                                                }`}
                                            >
                                                {togglingId === page.id ? (
                                                    <LoaderCircle className="h-3 w-3 animate-spin" />
                                                ) : page.is_published ? (
                                                    <Eye className="h-3 w-3" />
                                                ) : (
                                                    <EyeOff className="h-3 w-3" />
                                                )}
                                                {page.is_published ? 'Published' : 'Draft'}
                                            </button>
                                        </td>
                                        <td className="py-3 pl-3 pr-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/s/${business.slug}/pages/${page.slug}`}
                                                    target="_blank"
                                                    rel="noopener"
                                                    className="rounded p-1.5 text-site-muted hover:bg-site-surface hover:text-site-fg"
                                                    title="Preview"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/dashboard/b/${business.slug}/pages/${page.id}`}
                                                    className="rounded p-1.5 text-site-muted hover:bg-site-surface hover:text-site-fg"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(page)}
                                                    disabled={deletingId === page.id}
                                                    className="rounded p-1.5 text-site-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                                                    title="Delete"
                                                >
                                                    {deletingId === page.id
                                                        ? <LoaderCircle className="h-4 w-4 animate-spin" />
                                                        : <Trash2 className="h-4 w-4" />
                                                    }
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
        </AppSidebarLayout>
    );
}
