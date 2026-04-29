import { useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, Lock } from 'lucide-react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { update as updateProfile } from '@/routes/profile';
import type { Auth } from '@/types';

export default function Profile() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;

    const { data, setData, submit, processing, errors, recentlySuccessful } = useForm({
        name: user?.name ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(updateProfile(), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Profile', href: '/settings/profile' }]}>
            <SettingsLayout>
                <div className="space-y-1">
                    <h2 className="text-base font-semibold">Profile information</h2>
                    <p className="text-sm text-muted-foreground">Update your account name.</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            autoComplete="name"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email" className="flex items-center gap-1.5 text-muted-foreground">
                            Email
                            <Lock className="h-3 w-3" aria-hidden />
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={user?.email ?? ''}
                            disabled
                            readOnly
                            className="cursor-not-allowed bg-muted text-muted-foreground"
                        />
                        <p className="text-xs text-muted-foreground">
                            Email is tied to your sign-in and cannot be changed here.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-60"
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Save changes
                        </button>

                        {recentlySuccessful && (
                            <span className="text-sm text-muted-foreground">Saved.</span>
                        )}
                    </div>
                </form>
            </SettingsLayout>
        </AppLayout>
    );
}
