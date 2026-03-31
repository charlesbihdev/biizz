import { Link, router } from '@inertiajs/react';
import { LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { show as account } from '@/actions/App/Http/Controllers/CustomerAccountController';
import { destroy as logoutRoute } from '@/actions/App/Http/Controllers/StorefrontAuth/LogoutController';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';

interface Props {
    customer:        ReturnType<typeof useCustomerAuth>['customer'];
    isAuthenticated: boolean;
    accent:          string;
    businessSlug:    string;
    onAuthOpen:      () => void;
}

export default function AccountDropdown({
    customer,
    isAuthenticated,
    accent,
    businessSlug,
    onAuthOpen,
}: Props) {
    const [open, setOpen] = useState(false);

    if (!isAuthenticated) {
        return (
            <button
                type="button"
                onClick={onAuthOpen}
                className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-semibold transition hover:opacity-90"
                style={{ backgroundColor: accent }}
                aria-label="Account menu"
            >
                {customer?.avatar ? (
                    <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="h-full w-full rounded-full object-cover"
                    />
                ) : (
                    (customer?.name?.[0] ?? '?').toUpperCase()
                )}
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-zinc-100 bg-white py-1 shadow-lg">
                        <div className="border-b border-zinc-100 px-4 py-2.5">
                            <p className="truncate text-sm font-semibold text-zinc-900">
                                {customer?.name}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                                {customer?.email}
                            </p>
                        </div>
                        <Link
                            href={account.url(businessSlug)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50"
                            onClick={() => setOpen(false)}
                        >
                            <User className="h-4 w-4" />
                            My Account
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                router.post(logoutRoute.url(businessSlug));
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
