import { Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import { register } from '@/routes/marketplace';
import { google as googleRedirect } from '@/routes/marketplace/auth';
import { store as loginStore } from '@/routes/marketplace/login';
import { register as creatorRegister } from '@/routes';

interface LoginProps {
    status?: string;
}

function GoogleButton() {
    return (
        <a
            href={googleRedirect().url}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-site-border bg-white px-4 py-2.5 text-sm font-medium text-site-fg transition hover:border-brand hover:text-brand"
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

export default function BuyerLogin({ status }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, submit, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    return (
        <AuthSimpleLayout title="Welcome back" description="Sign in to your buyer account">
            {status && (
                <p className="mb-4 text-center text-sm font-medium text-green-600">{status}</p>
            )}

            <form
                onSubmit={(e) => { e.preventDefault(); submit(loginStore()); }}
                className="flex flex-col gap-4"
            >
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="email"
                        autoFocus
                        placeholder="you@example.com"
                        className="border-site-border focus-visible:ring-brand/30"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="border-site-border pr-10 focus-visible:ring-brand/30"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-site-muted hover:text-site-fg"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="remember"
                        checked={data.remember}
                        onCheckedChange={(checked) => setData('remember', !!checked)}
                    />
                    <Label htmlFor="remember" className="font-normal text-site-muted">
                        Remember me
                    </Label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                >
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Sign in
                </button>
            </form>

            <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-site-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-site-muted">or continue with</span>
                </div>
            </div>

            <GoogleButton />

            <p className="mt-5 text-center text-sm text-site-muted">
                Don't have a buyer account?{' '}
                <Link href={register().url} className="font-medium text-brand hover:underline">
                    Create one →
                </Link>
            </p>

            <p className="mt-2 text-center text-sm text-site-muted">
                Want to sell on biizz?{' '}
                <Link href={creatorRegister().url} className="font-medium text-brand hover:underline">
                    Create a creator account →
                </Link>
            </p>
        </AuthSimpleLayout>
    );
}
