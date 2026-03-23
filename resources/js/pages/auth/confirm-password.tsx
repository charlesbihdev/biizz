import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import { store as confirmStore } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    const { data, setData, submit, processing, errors } = useForm({
        password: '',
    });

    return (
        <AuthSimpleLayout
            title="Confirm your password"
            description="This area is protected. Please re-enter your password to continue."
        >
            <form
                onSubmit={(e) => { e.preventDefault(); submit(confirmStore()); }}
                className="flex flex-col gap-4"
            >
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="current-password"
                        autoFocus
                        placeholder="••••••••"
                        className="border-site-border focus-visible:ring-brand/30"
                    />
                    <InputError message={errors.password} />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                >
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Confirm
                </button>
            </form>
        </AuthSimpleLayout>
    );
}
