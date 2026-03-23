import { Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import { login } from '@/routes';
import { email as passwordEmail } from '@/routes/password';

interface ForgotPasswordProps {
    status?: string;
}

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const { data, setData, submit, processing, errors } = useForm({
        email: '',
    });

    return (
        <AuthSimpleLayout
            title="Forgot password?"
            description="Enter your email and we'll send you a reset link."
        >
            {status && (
                <p className="mb-4 text-center text-sm font-medium text-green-600">{status}</p>
            )}

            <form
                onSubmit={(e) => { e.preventDefault(); submit(passwordEmail()); }}
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

                <button
                    type="submit"
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                >
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Send reset link
                </button>
            </form>

            <p className="mt-5 text-center text-sm text-site-muted">
                <Link href={login().url} className="font-medium text-brand hover:underline">
                    ← Back to sign in
                </Link>
            </p>
        </AuthSimpleLayout>
    );
}
