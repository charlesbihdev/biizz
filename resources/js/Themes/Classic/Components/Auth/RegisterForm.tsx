import { useForm } from '@inertiajs/react';
import { store as registerRoute } from '@/actions/App/Http/Controllers/StorefrontAuth/RegisterController';
import type { Business } from '@/types/business';
import { Field, PasswordInput, SubmitButton } from './AuthFormField';

interface Props {
    business: Business;
    accent: string;
    onSuccess: () => void;
}

export default function RegisterForm({ business, accent, onSuccess }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name:                  '',
        email:                 '',
        password:              '',
        password_confirmation: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(registerRoute.url(business), { onSuccess, preserveScroll: true });
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
                    placeholder="Jane Doe"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                />
            </Field>

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
                    autoComplete="new-password"
                />
            </Field>

            <Field label="Confirm password" error={errors.password_confirmation}>
                <PasswordInput
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    autoComplete="new-password"
                />
            </Field>

            <SubmitButton accent={accent} processing={processing}>
                Create account
            </SubmitButton>
        </form>
    );
}
