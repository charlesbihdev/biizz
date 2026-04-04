import { FormSection } from '@/components/admin/form-section';
import type { CustomerLoginMode } from '@/types';

type Props = {
    value: CustomerLoginMode;
    onChange: (value: CustomerLoginMode) => void;
};

const MODES: { value: CustomerLoginMode; label: string; description: string }[] = [
    {
        value:       'none',
        label:       'No accounts',
        description: 'Guests only. No login prompt anywhere — fastest checkout experience.',
    },
    {
        value:       'checkout',
        label:       'Optional at checkout',
        description: 'Customers can browse freely but are prompted to log in or continue as guest at checkout.',
    },
    {
        value:       'full',
        label:       'Required',
        description: 'Customers must create an account and log in before they can browse or buy.',
    },
];

export function CustomerAccountsSection({ value, onChange }: Props) {
    return (
        <FormSection
            title="Customer Accounts"
            description="Control whether customers need an account to shop in your store."
        >
            <div className="flex flex-col gap-3">
                {MODES.map((mode) => {
                    const isActive = value === mode.value;
                    return (
                        <button
                            key={mode.value}
                            type="button"
                            onClick={() => onChange(mode.value)}
                            className={`flex items-start gap-4 rounded-xl border p-4 text-left transition ${
                                isActive
                                    ? 'border-brand bg-brand-dim'
                                    : 'border-site-border bg-white hover:border-brand/50'
                            }`}
                        >
                            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                isActive ? 'border-brand' : 'border-site-border'
                            }`}>
                                {isActive && <div className="h-2.5 w-2.5 rounded-full bg-brand" />}
                            </div>
                            <div>
                                <p className={`text-sm font-semibold ${isActive ? 'text-brand' : 'text-site-fg'}`}>
                                    {mode.label}
                                </p>
                                <p className="mt-0.5 text-xs text-site-muted">{mode.description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </FormSection>
    );
}
