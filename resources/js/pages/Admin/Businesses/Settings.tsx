import { useForm } from '@inertiajs/react';
import { CheckCircle2, CreditCard, LoaderCircle } from 'lucide-react';
import { ProviderCard } from '@/components/admin/payment/ProviderCard';
import { BrandSection } from '@/components/admin/businesses/settings/BrandSection';
import { ContactSection } from '@/components/admin/businesses/settings/ContactSection';
import { CustomerAccountsSection } from '@/components/admin/businesses/settings/CustomerAccountsSection';
import { ProfileSection } from '@/components/admin/businesses/settings/ProfileSection';
import { SeoSection } from '@/components/admin/businesses/settings/SeoSection';
import { SocialSection } from '@/components/admin/businesses/settings/SocialSection';
import { StoreTypeSection } from '@/components/admin/businesses/settings/StoreTypeSection';
import { FormSection } from '@/components/admin/form-section';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { update as settingsUpdate } from '@/routes/businesses/settings';
import type { Business, BusinessCategory, CustomerLoginMode, SocialLinks } from '@/types';

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
        _method:              'patch' as string,
        name:                 business.name ?? '',
        logo:                 null as File | null,
        tagline:              business.tagline ?? '',
        business_category:    (business.business_category ?? '') as BusinessCategory | '',
        description:          business.description ?? '',
        contact_email:        business.contact_email ?? '',
        phone:                business.phone ?? '',
        address:              business.address ?? '',
        website:              business.website ?? '',
        social_links: {
            instagram: sl.instagram ?? '',
            whatsapp:  sl.whatsapp  ?? '',
            facebook:  sl.facebook  ?? '',
            tiktok:    sl.tiktok    ?? '',
            twitter:   sl.twitter   ?? '',
        },
        favicon:              null as File | null,
        seo_title:            business.seo_title ?? '',
        seo_description:      business.seo_description ?? '',
        seo_image:            null as File | null,
        show_branding:        business.show_branding ?? true,
        customer_login_mode:  business.customer_login_mode ?? 'checkout',
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
                    <BrandSection
                        business={business}
                        tagline={data.tagline}
                        errors={errors}
                        onTaglineChange={(v) => setData('tagline', v)}
                        onLogoChange={(f) => setData('logo', f)}
                        onFaviconChange={(f) => setData('favicon', f)}
                    />

                    <StoreTypeSection
                        business={business}
                        businessCategory={data.business_category}
                        errors={errors}
                        onCategoryChange={(v) => setData('business_category', v)}
                    />

                    <ProfileSection
                        name={data.name}
                        website={data.website}
                        description={data.description}
                        errors={errors}
                        onNameChange={(v) => setData('name', v)}
                        onWebsiteChange={(v) => setData('website', v)}
                        onDescriptionChange={(v) => setData('description', v)}
                    />

                    <ContactSection
                        contactEmail={data.contact_email}
                        phone={data.phone}
                        address={data.address}
                        errors={errors}
                        onContactEmailChange={(v) => setData('contact_email', v)}
                        onPhoneChange={(v) => setData('phone', v)}
                        onAddressChange={(v) => setData('address', v)}
                    />

                    <SocialSection
                        socialLinks={data.social_links}
                        onSocialChange={setSocial}
                    />

                    <SeoSection
                        business={business}
                        seoTitle={data.seo_title}
                        seoDescription={data.seo_description}
                        showBranding={data.show_branding}
                        errors={errors}
                        onSeoTitleChange={(v) => setData('seo_title', v)}
                        onSeoDescriptionChange={(v) => setData('seo_description', v)}
                        onSeoImageChange={(f) => setData('seo_image', f)}
                        onShowBrandingChange={(v) => setData('show_branding', v)}
                    />

                    <CustomerAccountsSection
                        value={data.customer_login_mode as CustomerLoginMode}
                        onChange={(v) => setData('customer_login_mode', v)}
                    />

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
