import { Link, router }  from '@inertiajs/react';
import {
    ChevronRight,
    CreditCard,
    LogOut,
    MapPin,
    Package,
    ShoppingBag,
    User,
} from 'lucide-react';
import { destroy as logoutRoute } from '@/actions/App/Http/Controllers/StorefrontAuth/LogoutController';
import {
    orders    as ordersRoute,
    payments  as paymentsRoute,
    addresses as addressesRoute,
    profile   as profileRoute,
} from '@/actions/App/Http/Controllers/CustomerAccountController';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';
import type { Business, Section } from './types';

interface AccountSidebarProps {
    business: Business;
    section:  Section;
    accent:   string;
}

export function AccountSidebar({ business, section, accent }: AccountSidebarProps) {
    const { customer } = useCustomerAuth();

    const navItems: { key: Section; label: string; icon: React.ReactNode; href: string }[] = [
        { key: 'orders',    label: 'Orders',    icon: <Package    className="h-4 w-4" />, href: ordersRoute.url(business)   },
        { key: 'payments',  label: 'Payments',  icon: <CreditCard className="h-4 w-4" />, href: paymentsRoute.url(business) },
        { key: 'addresses', label: 'Addresses', icon: <MapPin     className="h-4 w-4" />, href: addressesRoute.url(business) },
        { key: 'profile',   label: 'Profile',   icon: <User       className="h-4 w-4" />, href: profileRoute.url(business)  },
    ];

    return (
        <aside className="w-full shrink-0 lg:w-64">
            <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
                {/* Customer info */}
                <div className="border-b border-zinc-100 px-5 py-4">
                    <div
                        className="mb-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: accent }}
                    >
                        {customer?.avatar ? (
                            <img src={customer.avatar} alt={customer.name} className="h-full w-full object-cover" />
                        ) : (
                            (customer?.name?.[0] ?? '?').toUpperCase()
                        )}
                    </div>
                    <p className="truncate font-semibold text-zinc-900">{customer?.name}</p>
                    <p className="truncate text-xs text-zinc-400">{customer?.email}</p>
                </div>

                {/* Nav */}
                <nav className="p-2">
                    {navItems.map(({ key, label, icon, href }) => (
                        <Link
                            key={key}
                            href={href}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
                            style={section === key
                                ? { backgroundColor: accent + '18', color: accent }
                                : { color: '#52525b' }}
                        >
                            {icon}
                            {label}
                            {section === key && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-zinc-100 p-2">
                    <Link
                        href={`/s/${business.slug}`}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
                    >
                        <ShoppingBag className="h-4 w-4" /> Continue Shopping
                    </Link>
                    <button
                        type="button"
                        onClick={() => router.post(logoutRoute.url(business))}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
                    >
                        <LogOut className="h-4 w-4" /> Logout
                    </button>
                </div>
            </div>
        </aside>
    );
}
