import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Business } from '@/types/business';
import GoogleAuthButton from './GoogleAuthButton';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

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

    useEffect(() => {
        if (isOpen) setTab('login');
    }, [isOpen]);

    if (!isOpen) return null;

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
                        <p className="mt-0.5 text-sm text-zinc-500">{business.name}</p>
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
                                style={tab === t ? { backgroundColor: accent, color: '#fff' } : { color: '#71717a' }}
                            >
                                {t === 'login' ? 'Sign in' : 'Register'}
                            </button>
                        ))}
                    </div>

                    <GoogleAuthButton business={business} />

                    <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-zinc-200" />
                        <span className="text-xs text-zinc-400">or</span>
                        <div className="h-px flex-1 bg-zinc-200" />
                    </div>

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
                            <button type="button" onClick={() => setTab('register')} className="font-semibold" style={{ color: accent }}>
                                Register
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button type="button" onClick={() => setTab('login')} className="font-semibold" style={{ color: accent }}>
                                Sign in
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
