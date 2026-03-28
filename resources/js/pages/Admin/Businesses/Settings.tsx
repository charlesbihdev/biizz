import { useForm } from '@inertiajs/react';
import { CheckCircle2, CreditCard, Facebook, Globe, Instagram, LoaderCircle, Lock, MessageCircle, Package, Twitter, Zap } from 'lucide-react';
import { FileUploader } from '@/components/admin/theme/FileUploader';
import { FormSection } from '@/components/admin/form-section';
import { ProviderCard } from '@/components/admin/payment/ProviderCard';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BUSINESS_CATEGORIES } from '@/data/businessCategories';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { update as settingsUpdate } from '@/routes/businesses/settings';
import type { Business, BusinessCategory, SocialLinks } from '@/types';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label>{label}</Label>
            {children}
            {error && <InputError message={error} />}
        </div>
    );
}

type Provider = {
    connected: boolean;
    label: string;
    regions: string[];
    has_client_id?: boolean;
};

type Props = {
    business: Business;
    providers: Record<string, Provider>;
};

export default function BusinessSettings({ business, providers }: Props) {
    const b = { business: business.slug };
    const sl: SocialLinks = business.social_links ?? {};

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        _method:           'patch' as string,
        name:              business.name ?? '',
        logo:              null as File | null,
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
        favicon:         null as File | null,
        seo_title:       business.seo_title ?? '',
        seo_description: business.seo_description ?? '',
        seo_image:       null as File | null,
        show_branding:   business.show_branding ?? true,
    });

    const setSocial = (key: keyof SocialLinks, value: string) => {
        setData('social_links', { ...data.social_links, [key]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(settingsUpdate(b).url, { preserveScroll: true, preserveState: true, forceFormData: true });
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
                    onSubmit={(e) => { void handleSubmit(e); }}
                    className="flex flex-col gap-8"
                >
                    {/* ── Brand ── */}
                    <FormSection
                        title="Brand"
                        description="Your logo and tagline appear on your storefront across all themes."
                    >
                        <Field label="Logo" error={errors.logo}>
                            <FileUploader
                                business={business}
                                value={business.logo_url ?? undefined}
                                onChange={(file) => setData('logo', file ?? null)}
                            />
                            <p className="text-xs text-site-muted">PNG, JPG or SVG. Falls back to your business name if not set.</p>
                        </Field>

                        <Field label="Favicon" error={errors.favicon}>
                            <FileUploader
                                business={business}
                                value={business.favicon_url ?? undefined}
                                dimensions="32×32 px recommended"
                                onChange={(file) => setData('favicon', file ?? null)}
                            />
                            <p className="text-xs text-site-muted">Small icon shown in browser tabs. Falls back to your logo if not set.</p>
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
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <Label>Business type</Label>
                                <div className="flex h-full items-center gap-3 rounded-lg border border-site-border bg-zinc-50 p-4">
                                    {business.business_type === 'digital' ? (
                                        <Zap className="h-5 w-5 text-brand" />
                                    ) : (
                                        <Package className="h-5 w-5 text-brand" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold capitalize text-site-fg">
                                            {business.business_type}
                                        </p>
                                        <p className="text-[11px] leading-tight text-site-muted">
                                            {business.business_type === 'digital'
                                                ? 'Files and downloads. 5% per-sale commission.'
                                                : 'Goods with stock management. Subscription billing.'}
                                        </p>
                                    </div>
                                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                                        <Lock className="h-3 w-3" />
                                        Locked
                                    </span>
                                </div>
                            </div>

                            <Field label="Category" error={errors.business_category}>
                                <select
                                    value={data.business_category}
                                    onChange={(e) => setData('business_category', e.target.value as BusinessCategory | '')}
                                    className="h-full min-h-[58px] w-full rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus:ring-2 focus:ring-brand/30"
                                >
                                    <option value="">Select a category…</option>
                                    {BUSINESS_CATEGORIES.map((cat) => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </FormSection>

                    {/* ── Profile ── */}
                    <FormSection
                        title="Profile"
                        description="How your business appears to customers on the storefront."
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Field label="Business name" error={errors.name}>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Zara's Boutique"
                                    className="border-site-border focus-visible:ring-brand/30"
                                />
                            </Field>

                            <Field label="Website" error={errors.website}>
                                <div className="flex h-full items-center rounded-lg border border-site-border bg-white focus-within:ring-2 focus-within:ring-brand/30">
                                    <Globe className="ml-3 h-4 w-4 shrink-0 text-site-muted" />
                                    <Input
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                        placeholder="https://yourbrand.com"
                                        className="h-full border-0 focus-visible:ring-0"
                                    />
                                </div>
                            </Field>
                        </div>

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

                    {/* ── SEO ── */}
                    <FormSection
                        title="SEO"
                        description="Control how your store appears in Google, Facebook, and WhatsApp link previews."
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Field label="SEO Title" error={errors.seo_title}>
                                <Input
                                    value={data.seo_title}
                                    onChange={(e) => setData('seo_title', e.target.value)}
                                    placeholder={business.name}
                                    maxLength={70}
                                    className="border-site-border focus-visible:ring-brand/30"
                                />
                                <p className="text-right text-[11px] text-site-muted/60">{data.seo_title.length}/70</p>
                            </Field>

                            <Field label="Social Share Image" error={errors.seo_image}>
                                <FileUploader
                                    business={business}
                                    value={business.seo_image ?? undefined}
                                    dimensions="1200×630 px"
                                    onChange={(file) => setData('seo_image', file ?? null)}
                                />
                                <p className="text-xs text-site-muted">Shown when your store is shared on social media. Falls back to logo.</p>
                            </Field>
                        </div>

                        <Field label="Meta Description" error={errors.seo_description}>
                            <Textarea
                                value={data.seo_description}
                                onChange={(e) => setData('seo_description', e.target.value)}
                                placeholder={business.tagline ?? business.description ?? 'Describe your store for search engines...'}
                                rows={3}
                                maxLength={300}
                                className="resize-none border-site-border focus-visible:ring-brand/30"
                            />
                            <p className="text-right text-[11px] text-site-muted/60">{data.seo_description.length}/300</p>
                        </Field>

                        <div className="rounded-lg border border-site-border bg-site-surface p-4">
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.show_branding}
                                    onChange={(e) => setData('show_branding', e.target.checked)}
                                    className="h-4 w-4 rounded border-site-border accent-brand"
                                />
                                <div>
                                    <p className="text-sm font-medium text-site-fg">Show "Powered by biizz.app" in footer</p>
                                    <p className="text-xs text-site-muted">
                                        When off, shows "© {new Date().getFullYear()} {business.name}. All rights reserved." instead.
                                    </p>
                                </div>
                            </label>
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

                {/* ── Payments (outside main form — ProviderCards have their own forms) ── */}
                <div className="mt-8">
                    <FormSection
                        title="Payments"
                        description="Connect a payment provider so customers can pay on your storefront."
                    >
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {Object.entries(providers).map(([id, provider]) => (
                                <ProviderCard
                                    key={id}
                                    business={business}
                                    providerId={id}
                                    label={provider.label}
                                    regions={provider.regions}
                                    connected={provider.connected}
                                    hasClientId={provider.has_client_id}
                                    isDefault={business.default_payment_provider === id}
                                />
                            ))}
                        </div>

                        {!Object.values(providers).some((p) => p.connected) && (
                            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                <CreditCard className="h-5 w-5 shrink-0 text-amber-600" />
                                <p className="text-sm text-amber-800">
                                    No payment provider connected. Customers will only be able to reach you via WhatsApp or contact info.
                                </p>
                            </div>
                        )}
                    </FormSection>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
