import { useForm } from '@inertiajs/react';
import { LoaderCircle, Mail } from 'lucide-react';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import { logout } from '@/routes';
import { send as verificationSend } from '@/routes/verification';

interface VerifyEmailProps {
    status?: string;
}

export default function VerifyEmail({ status }: VerifyEmailProps) {
    const { submit: submitResend, processing: resending } = useForm({});
    const { submit: submitLogout } = useForm({});

    return (
        <AuthSimpleLayout
            title="Verify your email"
            description="We sent a verification link to your inbox."
        >
            <div className="mb-5 flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-dim">
                    <Mail className="h-5 w-5 text-brand" />
                </div>
                <p className="text-sm text-site-muted">
                    Click the link in your email to verify your account. If you don't see it, check
                    your spam folder.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <p className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to your email.
                </p>
            )}

            <form onSubmit={(e) => { e.preventDefault(); submitResend(verificationSend()); }}>
                <button
                    type="submit"
                    disabled={resending}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                >
                    {resending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Resend verification email
                </button>
            </form>

            <p className="mt-4 text-center text-sm text-site-muted">
                Wrong account?{' '}
                <form onSubmit={(e) => { e.preventDefault(); submitLogout(logout()); }} className="inline">
                    <button type="submit" className="font-medium text-brand hover:underline">
                        Log out
                    </button>
                </form>
            </p>
        </AuthSimpleLayout>
    );
}
