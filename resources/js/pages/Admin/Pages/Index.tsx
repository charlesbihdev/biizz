import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, EyeOff, LoaderCircle, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
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
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

    const filtered = pages.filter((p) => {
        const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'published' && p.is_published) ||
            (statusFilter === 'draft' && !p.is_published);
        return matchesSearch && matchesStatus;
    });

    const isFiltered = !!search || statusFilter !== 'all';

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

                {/* Filters */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <div className="relative min-w-48 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-site-muted" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search pages…"
                            className="w-full rounded-lg border border-site-border bg-white py-2 pl-9 pr-3 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                        className="rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                    >
                        <option value="all">All status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                    {isFiltered && (
                        <button
                            type="button"
                            onClick={() => { setSearch(''); setStatusFilter('all'); }}
                            className="flex items-center gap-1 text-xs text-site-muted transition hover:text-site-fg"
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear
                        </button>
                    )}
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
                    <div className="overflow-x-auto rounded-xl border border-site-border bg-white">
                        <table className="min-w-160 w-full text-left">
                            <thead>
                                <tr className="border-b border-site-border bg-site-surface">
                                    <th className="py-2.5 pl-4 pr-3 text-xs font-semibold uppercase tracking-wide text-site-muted">#</th>
                                    <th className="py-2.5 pl-4 pr-3 text-xs font-semibold uppercase tracking-wide text-site-muted">Title</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Type</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Slug</th>
                                    <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-site-muted">Status</th>
                                    <th className="py-2.5 pl-3 pr-4" />
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((page, i) => (
                                    <tr key={page.id} className="border-b border-site-border last:border-0 hover:bg-site-surface/50">
                                        <td className="py-3 pl-4 pr-3 text-xs tabular-nums text-site-muted">{i + 1}</td>
                                        <td className="py-3 pl-4 pr-3">
                                            <p className="text-sm font-medium text-site-fg">{page.title}</p>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="text-sm text-site-muted">
                                                {page.type ? (PAGE_LABELS[page.type] ?? page.type) : 'Custom'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
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
                                                    href={`/s/${business.slug}/pages/${page.slug}?preview=1`}
                                                    target="_blank"
                                                    rel="noopener"
                                                    className="rounded p-1.5 text-site-muted hover:bg-site-surface hover:text-site-fg"
                                                    title="Preview"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <a
                                                    href={`/dashboard/b/${business.slug}/pages/${page.id}`}
                                                    target="_blank"
                                                    rel="noopener"
                                                    className="rounded p-1.5 text-site-muted hover:bg-site-surface hover:text-site-fg"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </a>
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
