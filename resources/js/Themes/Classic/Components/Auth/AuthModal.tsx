import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { store as loginRoute } from '@/actions/App/Http/Controllers/StorefrontAuth/LoginController';
import { store as registerRoute } from '@/actions/App/Http/Controllers/StorefrontAuth/RegisterController';
import type { Business } from '@/types/business';
import GoogleAuthButton from './GoogleAuthButton';

type Tab = 'login' | 'register';

interface Props {
    isOpen:   boolean;
    onClose:  () => void;
    business: Business;
    /** When true the modal cannot be dismissed (full gate mode) */
    required?: boolean;
}

export default function AuthModal({ isOpen, onClose, business, required = false }: Props) {
    const [tab, setTab] = useState<Tab>('login');
    const accent = business.theme_settings.accent_color ?? business.theme_settings.primary_color ?? '#1a1a1a';

    // Reset tab when modal opens
    useEffect(() => {
        if (isOpen) {
            setTab('login');
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={required ? undefined : onClose}
            />

            {/* Modal */}
            <div className="relative flex w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: '95vh' }}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
                            {tab === 'login' ? 'Sign in' : 'Create account'}
                        </h2>
                        <p className="mt-0.5 text-sm text-zinc-500">
                            {business.name}
                        </p>
                    </div>
                    {!required && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Tab switcher */}
                    <div className="mb-6 flex rounded-lg bg-zinc-100 p-1">
                        {(['login', 'register'] as Tab[]).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTab(t)}
                                className="flex-1 rounded-md py-1.5 text-sm font-medium transition"
                                style={
                                    tab === t
                                        ? { backgroundColor: accent, color: '#fff' }
                                        : { color: '#71717a' }
                                }
                            >
                                {t === 'login' ? 'Sign in' : 'Register'}
                            </button>
                        ))}
                    </div>

                    {/* Google button */}
                    <GoogleAuthButton business={business} />

                    {/* Divider */}
                    <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-zinc-200" />
                        <span className="text-xs text-zinc-400">or</span>
                        <div className="h-px flex-1 bg-zinc-200" />
                    </div>

                    {/* Form */}
                    {tab === 'login' ? (
                        <LoginForm business={business} accent={accent} onSuccess={onClose} />
                    ) : (
                        <RegisterForm business={business} accent={accent} onSuccess={onClose} />
                    )}
                </div>

                {/* Footer switch */}
                <div className="border-t border-zinc-100 px-6 py-4 text-center text-sm text-zinc-500">
                    {tab === 'login' ? (
                        <>
                            Don&apos;t have an account?{' '}
                            <button
                                type="button"
                                onClick={() => setTab('register')}
                                className="font-semibold"
                                style={{ color: accent }}
                            >
                                Register
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => setTab('login')}
                                className="font-semibold"
                                style={{ color: accent }}
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Login form ────────────────────────────────────────────────────────────────

function LoginForm({
    business,
    accent,
    onSuccess,
}: {
    business: Business;
    accent: string;
    onSuccess: () => void;
}) {
    const { data, setData, post, processing, errors } = useForm({
        email:    '',
        password: '',
        remember: false,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(loginRoute.url(business), {
            onSuccess,
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <Field label="Email" error={errors.email}>
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                    placeholder="you@example.com"
                />
            </Field>

            <Field label="Password" error={errors.password}>
                <input
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                    placeholder="••••••••"
                />
            </Field>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
                <input
                    type="checkbox"
                    checked={data.remember}
                    onChange={(e) => setData('remember', e.target.checked)}
                    className="rounded"
                />
                Remember me
            </label>

            <SubmitButton accent={accent} processing={processing}>
                Sign in
            </SubmitButton>
        </form>
    );
}

// ── Register form ─────────────────────────────────────────────────────────────

function RegisterForm({
    business,
    accent,
    onSuccess,
}: {
    business: Business;
    accent: string;
    onSuccess: () => void;
}) {
    const { data, setData, post, processing, errors } = useForm({
        name:                  '',
        email:                 '',
        password:              '',
        password_confirmation: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(registerRoute.url(business), {
            onSuccess,
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <Field label="Full name" error={errors.name}>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    autoComplete="name"
                    required
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                    placeholder="Jane Doe"
                />
            </Field>

            <Field label="Email" error={errors.email}>
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                    placeholder="you@example.com"
                />
            </Field>

            <Field label="Password" error={errors.password}>
                <input
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                    placeholder="••••••••"
                />
            </Field>

            <Field label="Confirm password" error={errors.password_confirmation}>
                <input
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                    placeholder="••••••••"
                />
            </Field>

            <SubmitButton accent={accent} processing={processing}>
                Create account
            </SubmitButton>
        </form>
    );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function SubmitButton({
    accent,
    processing,
    children,
}: {
    accent: string;
    processing: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            type="submit"
            disabled={processing}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: accent }}
        >
            {processing ? 'Please wait…' : children}
        </button>
    );
}
