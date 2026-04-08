import { Head, useForm } from '@inertiajs/react';
import { Chrome, Shield, User, Lock, Mail, CheckCircle2, Phone } from 'lucide-react';
import BuyerDashboardLayout from '@/layouts/marketplace/buyer-dashboard-layout';
import { update as accountUpdate } from '@/routes/marketplace/account';
import { cn } from '@/lib/utils';

type BuyerStats = { 
    purchase_count: number; 
    total_spent: string;
    pending_count: number;
    member_since: string;
    digital_assets: number;
};

interface Props {
    buyer: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        google_id: string | null;
        avatar: string | null;
    };
    stats: BuyerStats;
}

export default function Account({ buyer, stats }: Props) {
    const isGoogleOnly = !!buyer.google_id && !buyer.google_id.startsWith('email:');

    const profile = useForm({ name: buyer.name, email: buyer.email, phone: buyer.phone ?? '' });
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
        'w-full rounded-2xl border border-site-border bg-white px-4 py-3 text-sm font-medium text-site-fg shadow-sm outline-hidden ring-brand/20 transition-all focus:border-brand focus:ring-1 disabled:opacity-50';

    return (
        <BuyerDashboardLayout active="account" stats={stats}>
            <Head title="Account Settings — biizz.market" />

            {/* Header Section */}
            <div className="mb-10">
                <h1 className="text-3xl font-black tracking-tight text-site-fg lg:text-4xl">
                    Account <span className="text-brand">Settings</span>
                </h1>
                <p className="mt-2 text-sm font-medium text-site-muted">
                    Manage your personal information and account security.
                </p>
            </div>

            <div className="grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Left: Forms */}
                <div className="space-y-8 lg:col-span-12">
                    
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Profile Section */}
                        <section className="group relative rounded-3xl border border-site-border bg-white p-8 shadow-sm transition-all hover:border-brand/20 hover:shadow-md">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/5 text-brand ring-1 ring-brand/10">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-site-fg">Profile</h2>
                                    <p className="text-[10px] font-bold text-site-muted uppercase">Public identity</p>
                                </div>
                            </div>

                            <form onSubmit={saveProfile} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black tracking-wide text-site-muted uppercase">Full Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={profile.data.name}
                                            onChange={(e) => profile.setData('name', e.target.value)}
                                            className={inputClass}
                                            placeholder="Your name"
                                        />
                                    </div>
                                    {profile.errors.name && <p className="text-[10px] font-bold text-red-500">{profile.errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black tracking-wide text-site-muted uppercase">Email Address (Cannot be changed)</label>
                                    <div className="relative">
                                        <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <input
                                            type="email"
                                            value={profile.data.email}
                                            disabled
                                            className={cn(inputClass, "pl-11 bg-zinc-50 text-zinc-400 cursor-not-allowed")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black tracking-wide text-site-muted uppercase">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-site-muted" />
                                        <input
                                            type="tel"
                                            value={profile.data.phone}
                                            onChange={(e) => profile.setData('phone', e.target.value)}
                                            className={cn(inputClass, "pl-11")}
                                            placeholder="e.g. +233 55 123 4567"
                                        />
                                    </div>
                                    {profile.errors.phone && <p className="text-[10px] font-bold text-red-500">{profile.errors.phone}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={profile.processing}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-brand px-8 py-3.5 text-xs font-black text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-hover hover:shadow-brand/30 active:scale-95 disabled:opacity-60"
                                >
                                    {profile.processing ? 'Saving...' : 'Update Profile'}
                                </button>
                            </form>
                        </section>

                        {/* Security Section */}
                        <section className="group relative rounded-3xl border border-site-border bg-white p-8 shadow-sm transition-all hover:border-brand/20 hover:shadow-md">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-site-fg/5 text-site-fg ring-1 ring-site-fg/10">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-site-fg">Security</h2>
                                    <p className="text-[10px] font-bold text-site-muted uppercase">Access control</p>
                                </div>
                            </div>

                            {isGoogleOnly ? (
                                <div className="flex flex-col items-center justify-center rounded-2xl bg-blue-50/50 p-8 text-center ring-1 ring-blue-100">
                                    <Chrome className="mb-3 h-8 w-8 text-blue-500" />
                                    <p className="text-sm font-black text-blue-900">Google Authentication</p>
                                    <p className="mt-1 text-xs font-medium text-blue-700">
                                        You are signed in via Google. Your account is protected by Google security services.
                                    </p>
                                    <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Secure Link Active
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={savePassword} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black tracking-wide text-site-muted uppercase">Current Password</label>
                                        <input
                                            type="password"
                                            value={password.data.current_password}
                                            onChange={(e) => password.setData('current_password', e.target.value)}
                                            autoComplete="current-password"
                                            className={inputClass}
                                        />
                                        {password.errors.current_password && (
                                            <p className="text-[10px] font-bold text-red-500">{password.errors.current_password}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black tracking-wide text-site-muted uppercase">New Password</label>
                                        <input
                                            type="password"
                                            value={password.data.password}
                                            onChange={(e) => password.setData('password', e.target.value)}
                                            autoComplete="new-password"
                                            className={inputClass}
                                        />
                                        {password.errors.password && (
                                            <p className="text-[10px] font-bold text-red-500">{password.errors.password}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={password.processing}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-8 py-3.5 text-xs font-black text-white transition-all hover:bg-zinc-800 active:scale-95 disabled:opacity-60"
                                    >
                                        <Lock className="h-3.5 w-3.5" />
                                        {password.processing ? 'Updating...' : 'Change Password'}
                                    </button>
                                </form>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </BuyerDashboardLayout>
    );
}
