import { ProviderCard } from '@/components/admin/payment/ProviderCard';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { show } from '@/routes/businesses';
import { edit } from '@/routes/businesses/payments';
import type { Business } from '@/types';

type Provider = {
    connected: boolean;
    label: string;
    regions: string[];
};

type Props = {
    business: Business;
    providers: Record<string, Provider>;
};

export default function PaymentSettings({ business, providers }: Props) {
    const b = { business: business.slug };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: business.name, href: show(b).url },
                { title: 'Payments', href: edit(b).url },
            ]}
        >
            <div className="p-6 lg:p-8">
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-site-fg">Payment providers</h1>
                    <p className="mt-1 text-sm text-site-muted">
                        Connect a payment provider so customers can pay on your storefront.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    {Object.entries(providers).map(([id, provider]) => (
                        <ProviderCard
                            key={id}
                            business={business}
                            providerId={id}
                            label={provider.label}
                            regions={provider.regions}
                            connected={provider.connected}
                        />
                    ))}
                </div>
            </div>
        </AppSidebarLayout>
    );
}
