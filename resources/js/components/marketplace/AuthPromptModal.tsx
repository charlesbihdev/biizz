import { useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { google as googleRedirect } from '@/routes/marketplace/auth';
import { store as loginStore } from '@/routes/marketplace/login';
import { store as registerStore } from '@/routes/marketplace/register';

type Tab = 'login' | 'register';

interface Props {
    open: boolean;
    onClose: () => void;
    /** Called after successful auth — parent can re-trigger the purchase. */
    onAuthenticated: () => void;
}

function GoogleButton() {
    return (
        <a
            href={googleRedirect().url}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-site-border bg-white px-4 py-2.5 text-sm font-medium text-site-fg transition hover:border-brand hover:text-brand"
        >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
        </a>
    );
}

function Divider() {
    return (
        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-site-border" />
            </div>
            <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-site-muted">or</span>
            </div>
        </div>
    );
}

function PasswordField({
    label,
    value,
    onChange,
    autoComplete,
    error,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    autoComplete?: string;
    error?: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-site-fg">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-site-border px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-site-muted hover:text-site-fg"
                >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function LoginTab({ onSuccess }: { onSuccess: () => void }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    function submit(e: React.SyntheticEvent) {
        e.preventDefault();
        post(loginStore().url, { onSuccess, preserveScroll: true });
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-3">
            <div>
                <label className="mb-1.5 block text-xs font-medium text-site-fg">Email</label>
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-lg border border-site-border px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <PasswordField
                label="Password"
                value={data.password}
                onChange={(v) => setData('password', v)}
                autoComplete="current-password"
                error={errors.password}
            />

            <button
                type="submit"
                disabled={processing}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
            >
                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Sign in
            </button>
        </form>
    );
}

function RegisterTab({ onSuccess }: { onSuccess: () => void }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e: React.SyntheticEvent) {
        e.preventDefault();
        post(registerStore().url, { onSuccess, preserveScroll: true });
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-3">
            <div>
                <label className="mb-1.5 block text-xs font-medium text-site-fg">Full name</label>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    autoComplete="name"
                    placeholder="John Doe"
                    required
                    className="w-full rounded-lg border border-site-border px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-site-fg">Email</label>
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-lg border border-site-border px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <PasswordField
                label="Password"
                value={data.password}
                onChange={(v) => setData('password', v)}
                autoComplete="new-password"
                error={errors.password}
            />

            <PasswordField
                label="Confirm password"
                value={data.password_confirmation}
                onChange={(v) => setData('password_confirmation', v)}
                autoComplete="new-password"
            />

            <button
                type="submit"
                disabled={processing}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
            >
                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Create account
            </button>
        </form>
    );
}

export default function AuthPromptModal({ open, onClose, onAuthenticated }: Props) {
    const [tab, setTab] = useState<Tab>('login');

    useEffect(() => {
        if (open) setTab('login');
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center" style={{ top: '56px' }}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" style={{ top: '56px' }} onClick={onClose} />

            <div className="relative mx-4 flex w-full max-w-sm flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
                {/* Header — never scrolls */}
                <div className="shrink-0 flex items-center justify-between border-b border-site-border px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-site-fg">
                            {tab === 'login' ? 'Sign in to continue' : 'Create a free account'}
                        </h2>
                        <p className="mt-0.5 text-xs text-site-muted">You need a buyer account to purchase</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-site-muted transition hover:bg-site-surface hover:text-site-fg"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body — scrolls if content overflows */}
                <div className="overflow-y-auto p-6">
                    {/* Tab switcher */}
                    <div className="mb-5 flex rounded-xl bg-site-surface p-1">
                        {(['login', 'register'] as Tab[]).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTab(t)}
                                className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition ${
                                    tab === t
                                        ? 'bg-brand text-white shadow-sm'
                                        : 'text-site-muted hover:text-site-fg'
                                }`}
                            >
                                {t === 'login' ? 'Sign in' : 'Register'}
                            </button>
                        ))}
                    </div>

                    <GoogleButton />
                    <Divider />

                    {tab === 'login' ? (
                        <LoginTab onSuccess={onAuthenticated} />
                    ) : (
                        <RegisterTab onSuccess={onAuthenticated} />
                    )}
                </div>
            </div>
        </div>
    );
}
