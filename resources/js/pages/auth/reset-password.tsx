import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import { update as passwordUpdate } from '@/routes/password';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, submit, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    return (
        <AuthSimpleLayout title="Set new password" description="Choose a strong password for your account.">
            <form
                onSubmit={(e) => { e.preventDefault(); submit(passwordUpdate()); }}
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
                        className="border-site-border focus-visible:ring-brand/30"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password">New password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        autoFocus
                        placeholder="••••••••"
                        className="border-site-border focus-visible:ring-brand/30"
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password_confirmation">Confirm new password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="border-site-border focus-visible:ring-brand/30"
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                >
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Reset password
                </button>
            </form>
        </AuthSimpleLayout>
    );
}
