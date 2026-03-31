import ClassicThemeShell       from '../ThemeShell';
import { AccountSidebar }       from '../components/Account/AccountSidebar';
import { OrdersSection }        from '../components/Account/OrdersSection';
import { PaymentsSection }      from '../components/Account/PaymentsSection';
import { AddressesSection }     from '../components/Account/AddressesSection';
import { ProfileSection }       from '../components/Account/ProfileSection';
import type { AccountProps }    from '../components/Account/types';

export default function Account({ business, pages, section, orders, payments, addresses, filters }: AccountProps) {
    const { theme_settings: s } = business;
    const primary = s.primary_color ?? '#1a1a1a';
    const accent  = s.accent_color  ?? primary;

    return (
        <ClassicThemeShell business={business} pages={pages}>
            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <h1 className="mb-1 text-2xl font-bold" style={{ color: primary }}>My Account</h1>
                <p className="mb-8 text-sm text-zinc-500">Manage your orders, payments, and account settings.</p>

                <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                    <AccountSidebar business={business} section={section} accent={accent} />

                    <section className="min-w-0 flex-1">
                        {section === 'orders' && orders && filters && (
                            <OrdersSection orders={orders} business={business} accent={accent} filters={filters} />
                        )}
                        {section === 'payments' && payments && filters && (
                            <PaymentsSection payments={payments} business={business} accent={accent} filters={filters} />
                        )}
                        {section === 'addresses' && addresses && (
                            <AddressesSection addresses={addresses} business={business} accent={accent} />
                        )}
                        {section === 'profile' && (
                            <ProfileSection business={business} accent={accent} />
                        )}
                    </section>
                </div>
            </main>
        </ClassicThemeShell>
    );
}
