import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Chrome } from 'lucide-react';
import BuyerDashboardLayout from '@/layouts/marketplace/buyer-dashboard-layout';
import { update as accountUpdate } from '@/routes/marketplace/account';

type BuyerStats = { purchase_count: number; total_spent: string };

interface Props {
    buyer: {
        id: number;
        name: string;
        email: string;
        google_id: string | null;
        avatar: string | null;
    };
    stats: BuyerStats;
}

export default function Account({ buyer, stats }: Props) {
    const isGoogleOnly = !!buyer.google_id && !buyer.google_id.startsWith('email:');

    const profile = useForm({ name: buyer.name, email: buyer.email });
    const password = useForm({ current_password: '', password: '', password_confirmation: '' });

    const saveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profile.put(accountUpdate().url);
    };

    const savePassword = (e: React.FormEvent) => {
        e.preventDefault();
        password.put(accountUpdate().url, {
            onSuccess: () => password.reset(),
        });
    };

    const inputClass =
        'w-full rounded-xl border border-site-border bg-white px-4 py-2.5 text-sm text-site-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-50';

    return (
        <BuyerDashboardLayout active="account" stats={stats}>
            <Head title="Account — biizz.market" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-site-fg">Account</h1>
                <p className="mt-0.5 text-sm text-site-muted">Manage your profile and security settings.</p>
            </div>

            <div className="flex max-w-lg flex-col gap-6">
                {/* Profile */}
                <section className="rounded-2xl border border-site-border bg-white p-6">
                    <h2 className="mb-4 text-sm font-semibold text-site-fg">Profile</h2>
                    <form onSubmit={saveProfile} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-site-muted">Name</label>
                            <input
                                type="text"
                                value={profile.data.name}
                                onChange={(e) => profile.setData('name', e.target.value)}
                                className={inputClass}
                            />
                            {profile.errors.name && <p className="text-xs text-red-500">{profile.errors.name}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-site-muted">Email</label>
                            <input
                                type="email"
                                value={profile.data.email}
                                onChange={(e) => profile.setData('email', e.target.value)}
                                className={inputClass}
                            />
                            {profile.errors.email && <p className="text-xs text-red-500">{profile.errors.email}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={profile.processing}
                            className="self-start rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-60"
                        >
                            {profile.processing ? 'Saving…' : 'Save changes'}
                        </button>
                    </form>
                </section>

                {/* Password / Sign-in method */}
                <section className="rounded-2xl border border-site-border bg-white p-6">
                    <h2 className="mb-4 text-sm font-semibold text-site-fg">Security</h2>

                    {isGoogleOnly ? (
                        <div className="flex items-center gap-2 text-sm text-site-muted">
                            <Chrome className="h-4 w-4 shrink-0" />
                            You signed up with Google. No password is required.
                        </div>
                    ) : (
                        <form onSubmit={savePassword} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-site-muted">Current password</label>
                                <input
                                    type="password"
                                    value={password.data.current_password}
                                    onChange={(e) => password.setData('current_password', e.target.value)}
                                    autoComplete="current-password"
                                    className={inputClass}
                                />
                                {password.errors.current_password && (
                                    <p className="text-xs text-red-500">{password.errors.current_password}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-site-muted">New password</label>
                                <input
                                    type="password"
                                    value={password.data.password}
                                    onChange={(e) => password.setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    className={inputClass}
                                />
                                {password.errors.password && (
                                    <p className="text-xs text-red-500">{password.errors.password}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-site-muted">Confirm new password</label>
                                <input
                                    type="password"
                                    value={password.data.password_confirmation}
                                    onChange={(e) => password.setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    className={inputClass}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={password.processing}
                                className="self-start rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-60"
                            >
                                {password.processing ? 'Updating…' : 'Update password'}
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </BuyerDashboardLayout>
    );
}
