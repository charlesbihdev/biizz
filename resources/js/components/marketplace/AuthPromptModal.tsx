import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import RoleSelector from '@/components/marketplace/RoleSelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    open: boolean;
    onClose: () => void;
    onAuthenticated: () => void;
}

type Tab = 'login' | 'register';

interface FormState {
    name: string;
    email: string;
    password: string;
    role: 'buyer' | 'creator';
}

export default function AuthPromptModal({ open, onClose, onAuthenticated }: Props) {
    const [tab, setTab] = useState<Tab>('login');
    const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', role: 'buyer' });
    const [errors, setErrors] = useState<Partial<FormState>>({});
    const [processing, setProcessing] = useState(false);

    if (!open) {
        return null;
    }

    function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/login', { email: form.email, password: form.password }, {
            onError: (err) => { setErrors(err as Partial<FormState>); setProcessing(false); },
            onSuccess: () => { onAuthenticated(); },
        });
    }

    function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/register', {
            name:                  form.name,
            email:                 form.email,
            password:              form.password,
            password_confirmation: form.password,
            role:                  form.role,
        }, {
            onError: (err) => { setErrors(err as Partial<FormState>); setProcessing(false); },
            onSuccess: () => {
                if (form.role === 'creator') {
                    router.visit('/dashboard/b/create');
                } else {
                    onAuthenticated();
                }
            },
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl border border-site-border bg-site-bg p-6 shadow-xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1 text-site-muted transition hover:text-site-fg"
                >
                    <X className="h-4 w-4" />
                </button>

                <p className="mb-1 text-lg font-bold text-site-fg">One more step</p>
                <p className="mb-5 text-sm text-site-muted">Sign in or create a free account to continue.</p>

                {/* Tabs */}
                <div className="mb-5 flex rounded-xl border border-site-border p-1">
                    {(['login', 'register'] as Tab[]).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={[
                                'flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition',
                                tab === t
                                    ? 'bg-brand text-white shadow-sm'
                                    : 'text-site-muted hover:text-site-fg',
                            ].join(' ')}
                        >
                            {t === 'login' ? 'Sign in' : 'Create account'}
                        </button>
                    ))}
                </div>

                {tab === 'login' ? (
                    <form onSubmit={handleLogin} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="border-site-border" />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="border-site-border" />
                            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                        </div>
                        <button type="submit" disabled={processing} className="mt-1 w-full rounded-xl bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60">
                            {processing ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="reg-name">Full name</Label>
                            <Input id="reg-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="border-site-border" />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="reg-email">Email</Label>
                            <Input id="reg-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="border-site-border" />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="reg-password">Password</Label>
                            <Input id="reg-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="border-site-border" />
                            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                        </div>
                        <RoleSelector role={form.role} onChange={(r) => setForm({ ...form, role: r })} />
                        <button type="submit" disabled={processing} className="mt-1 w-full rounded-xl bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60">
                            {processing ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
