import { useForm } from '@inertiajs/react';
import { CheckCircle2, Facebook, Globe, Instagram, LoaderCircle, Lock, MessageCircle, Package, Twitter, Zap } from 'lucide-react';
import { FileUploader } from '@/components/admin/theme/FileUploader';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BUSINESS_CATEGORIES } from '@/data/businessCategories';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { update as settingsUpdate } from '@/routes/businesses/settings';
import type { Business, BusinessCategory, SocialLinks } from '@/types';

import { FormSection } from '@/components/admin/form-section';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label>{label}</Label>
            {children}
            {error && <InputError message={error} />}
        </div>
    );
}

export default function BusinessSettings({ business }: { business: Business }) {
    const b = { business: business.slug };
    const sl: SocialLinks = business.social_links ?? {};

    const { data, setData, submit, processing, errors, recentlySuccessful } = useForm({
        name:              business.name ?? '',
        logo_url:          business.logo_url ?? '',
        tagline:           business.tagline ?? '',
        business_category: (business.business_category ?? '') as BusinessCategory | '',
        description:       business.description ?? '',
        contact_email:     business.contact_email ?? '',
        phone:             business.phone ?? '',
        address:           business.address ?? '',
        website:           business.website ?? '',
        social_links: {
            instagram: sl.instagram ?? '',
            whatsapp:  sl.whatsapp  ?? '',
            facebook:  sl.facebook  ?? '',
            tiktok:    sl.tiktok    ?? '',
            twitter:   sl.twitter   ?? '',
        },
    });

    const setSocial = (key: keyof SocialLinks, value: string) => {
        setData('social_links', { ...data.social_links, [key]: value });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: show(b).url },
                { title: 'Business Settings', href: '#' },
            ]}
        >
            <div className="p-6 lg:p-8">

                <div className="mb-8">
                    <h1 className="text-xl font-bold text-site-fg">Business Settings</h1>
                    <p className="mt-1 text-sm text-site-muted">
                        Update your business profile, contact details, and social presence.
                    </p>
                </div>

                <form
                    onSubmit={(e) => { e.preventDefault(); submit(settingsUpdate(b)); }}
                    className="flex flex-col gap-8"
                >
                    {/* ── Brand ── */}
                    <FormSection
                        title="Brand"
                        description="Your logo and tagline appear on your storefront across all themes."
                    >
                        <Field label="Logo" error={errors.logo_url}>
                            <FileUploader
                                business={business}
                                value={data.logo_url}
                                onChange={(url) => setData('logo_url', url)}
                            />
                            <p className="text-xs text-site-muted">PNG, JPG or SVG. Falls back to your business name if not set.</p>
                        </Field>

                        <Field label="Tagline" error={errors.tagline}>
                            <Input
                                value={data.tagline}
                                onChange={(e) => setData('tagline', e.target.value)}
                                placeholder="Dress to impress, every day."
                                maxLength={150}
                                className="border-site-border focus-visible:ring-brand/30"
                            />
                            <p className="text-right text-[11px] text-site-muted/60">{data.tagline.length}/150</p>
                        </Field>
                    </FormSection>

                    {/* ── Store Type ── */}
                    <FormSection
                        title="Store Type"
                        description="Choose what kind of store you run and your industry category."
                    >
                        <div className="flex flex-col gap-2">
                            <Label>Business type</Label>
                            <div className="flex items-center gap-3 rounded-xl border border-site-border bg-zinc-50 p-4">
                                {business.business_type === 'digital' ? (
                                    <Zap className="h-5 w-5 text-brand" />
                                ) : (
                                    <Package className="h-5 w-5 text-brand" />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-semibold capitalize text-site-fg">
                                        {business.business_type}
                                    </p>
                                    <p className="text-xs text-site-muted">
                                        {business.business_type === 'digital'
                                            ? 'Files and downloads. 5% per-sale commission.'
                                            : 'Goods with stock management. Subscription billing.'}
                                    </p>
                                </div>
                                <span className="flex items-center gap-1 rounded-full bg-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-500">
                                    <Lock className="h-3 w-3" />
                                    Locked
                                </span>
                            </div>
                        </div>

                        <Field label="Category" error={errors.business_category}>
                            <select
                                value={data.business_category}
                                onChange={(e) => setData('business_category', e.target.value as BusinessCategory | '')}
                                className="w-full rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus:ring-2 focus:ring-brand/30"
                            >
                                <option value="">Select a category…</option>
                                {BUSINESS_CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </Field>
                    </FormSection>

                    {/* ── Profile ── */}
                    <FormSection
                        title="Profile"
                        description="How your business appears to customers on the storefront."
                    >
                        <Field label="Business name" error={errors.name}>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Zara's Boutique"
                                className="border-site-border focus-visible:ring-brand/30"
                            />
                        </Field>

                        <Field label="Description" error={errors.description}>
                            <Textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Tell customers what makes your business special..."
                                rows={3}
                                className="resize-none border-site-border focus-visible:ring-brand/30"
                            />
                            <p className="text-right text-[11px] text-site-muted/60">
                                {data.description.length}/500
                            </p>
                        </Field>

                        <Field label="Website" error={errors.website}>
                            <div className="flex items-center rounded-lg border border-site-border bg-white focus-within:ring-2 focus-within:ring-brand/30">
                                <Globe className="ml-3 h-4 w-4 shrink-0 text-site-muted" />
                                <Input
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    placeholder="https://yourbrand.com"
                                    className="border-0 focus-visible:ring-0"
                                />
                            </div>
                        </Field>
                    </FormSection>

                    {/* ── Contact ── */}
                    <FormSection
                        title="Contact"
                        description="Displayed on your storefront so customers can reach you."
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Email" error={errors.contact_email}>
                                <Input
                                    type="email"
                                    value={data.contact_email}
                                    onChange={(e) => setData('contact_email', e.target.value)}
                                    placeholder="hello@yourbrand.com"
                                    className="border-site-border focus-visible:ring-brand/30"
                                />
                            </Field>
                            <Field label="Phone" error={errors.phone}>
                                <Input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+233 20 000 0000"
                                    className="border-site-border focus-visible:ring-brand/30"
                                />
                            </Field>
                        </div>

                        <Field label="Address" error={errors.address}>
                            <Textarea
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="123 Main Street, Accra, Ghana"
                                rows={2}
                                className="resize-none border-site-border focus-visible:ring-brand/30"
                            />
                        </Field>
                    </FormSection>

                    {/* ── Social links ── */}
                    <FormSection
                        title="Social & Links"
                        description="Connect your social profiles to build trust with customers."
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {(
                                [
                                    { key: 'instagram', label: 'Instagram', icon: Instagram,     placeholder: 'https://instagram.com/yourbrand' },
                                    { key: 'whatsapp',  label: 'WhatsApp',  icon: MessageCircle, placeholder: '+233 20 000 0000' },
                                    { key: 'facebook',  label: 'Facebook',  icon: Facebook,      placeholder: 'https://facebook.com/yourbrand' },
                                    { key: 'tiktok',    label: 'TikTok',    icon: Globe,         placeholder: 'https://tiktok.com/@yourbrand' },
                                    { key: 'twitter',   label: 'X / Twitter', icon: Twitter,     placeholder: 'https://x.com/yourbrand' },
                                ] as const
                            ).map(({ key, label, icon: Icon, placeholder }) => (
                                <Field key={key} label={label}>
                                    <div className="flex items-center rounded-lg border border-site-border bg-white focus-within:ring-2 focus-within:ring-brand/30">
                                        <Icon className="ml-3 h-4 w-4 shrink-0 text-site-muted" />
                                        <Input
                                            value={data.social_links[key]}
                                            onChange={(e) => setSocial(key, e.target.value)}
                                            placeholder={placeholder}
                                            className="border-0 focus-visible:ring-0"
                                        />
                                    </div>
                                </Field>
                            ))}
                        </div>
                    </FormSection>

                    {/* ── Save ── */}
                    <div className="flex items-center justify-end gap-3">
                        {recentlySuccessful && (
                            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Saved
                            </span>
                        )}
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
