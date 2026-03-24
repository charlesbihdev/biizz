import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import { store as twoFactorStore } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [useRecovery, setUseRecovery] = useState(false);

    const { data, setData, submit, processing, errors } = useForm({
        code: '',
        recovery_code: '',
    });

    return (
        <AuthSimpleLayout
            title="Two-factor authentication"
            description={useRecovery ? 'Enter one of your recovery codes.' : 'Enter the code from your authenticator app.'}
        >
            <form
                onSubmit={(e) => { e.preventDefault(); submit(twoFactorStore()); }}
                className="flex flex-col gap-4"
            >
                {useRecovery ? (
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="recovery_code">Recovery code</Label>
                        <Input
                            id="recovery_code"
                            type="text"
                            value={data.recovery_code}
                            onChange={(e) => setData('recovery_code', e.target.value)}
                            autoComplete="one-time-code"
                            autoFocus
                            className="border-site-border focus-visible:ring-brand/30"
                        />
                        <InputError message={errors.recovery_code} />
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="code">Authentication code</Label>
                        <Input
                            id="code"
                            type="text"
                            inputMode="numeric"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            autoComplete="one-time-code"
                            autoFocus
                            className="border-site-border focus-visible:ring-brand/30"
                        />
                        <InputError message={errors.code} />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                >
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Verify
                </button>
            </form>

            <button
                type="button"
                onClick={() => setUseRecovery((v) => !v)}
                className="mt-4 w-full text-center text-sm text-site-muted hover:text-brand"
            >
                {useRecovery ? 'Use authentication code instead' : 'Use a recovery code instead'}
            </button>
        </AuthSimpleLayout>
    );
}
