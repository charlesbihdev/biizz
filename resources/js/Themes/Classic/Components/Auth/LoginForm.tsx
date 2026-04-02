import { useForm } from '@inertiajs/react';
import { store as loginRoute } from '@/actions/App/Http/Controllers/StorefrontAuth/LoginController';
import type { Business } from '@/types/business';
import { Field, PasswordInput, SubmitButton } from './AuthFormField';

interface Props {
    business: Business;
    accent: string;
    onSuccess: () => void;
}

export default function LoginForm({ business, accent, onSuccess }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email:    '',
        password: '',
        remember: false,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(loginRoute.url(business), { onSuccess, preserveScroll: true });
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
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                />
            </Field>

            <Field label="Password" error={errors.password}>
                <PasswordInput
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    autoComplete="current-password"
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
