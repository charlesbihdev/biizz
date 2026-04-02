import { useForm }         from '@inertiajs/react';
import { updateProfile }   from '@/actions/App/Http/Controllers/CustomerAccountController';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';
import { FlashMessages }   from './FlashMessages';
import type { Business }   from './types';

interface ProfileSectionProps {
    business: Business;
    accent:   string;
}

export function ProfileSection({ business, accent }: ProfileSectionProps) {
    const { customer } = useCustomerAuth();

    const { data, setData, patch, processing, errors } = useForm({
        name:  customer?.name  ?? '',
        email: customer?.email ?? '',
        phone: customer?.phone ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        patch(updateProfile.url(business), { preserveScroll: true });
    }

    const fields = [
        { label: 'Full Name',    key: 'name',  type: 'text', placeholder: 'Jane Doe',         autoComplete: 'name',  required: true  },
        { label: 'Phone Number', key: 'phone', type: 'tel',  placeholder: '+233 XX XXX XXXX', autoComplete: 'tel',   required: false },
    ] as const;

    return (
        <form onSubmit={submit} className="max-w-md space-y-5">
            <FlashMessages />

            <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Email</label>
                <input
                    type="email"
                    value={data.email}
                    readOnly
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-400 outline-none cursor-not-allowed"
                />
            </div>

            {fields.map(({ label, key, type, placeholder, autoComplete, required }) => (
                <div key={key}>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">{label}</label>
                    <input
                        type={type}
                        value={data[key]}
                        onChange={(e) => setData(key, e.target.value)}
                        autoComplete={autoComplete}
                        placeholder={placeholder}
                        required={required}
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                    />
                    {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
                </div>
            ))}
            <button type="submit" disabled={processing}
                className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: accent }}>
                {processing ? 'Saving…' : 'Save Changes'}
            </button>
        </form>
    );
}
