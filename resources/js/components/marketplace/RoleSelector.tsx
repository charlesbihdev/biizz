import { BookOpen, Store } from 'lucide-react';

interface Props {
    role: 'buyer' | 'creator';
    onChange: (role: 'buyer' | 'creator') => void;
}

const OPTIONS = [
    {
        value: 'buyer' as const,
        icon: BookOpen,
        title: 'I want to buy',
        desc: 'Browse and purchase digital products',
    },
    {
        value: 'creator' as const,
        icon: Store,
        title: 'I want to sell',
        desc: 'Create a store and sell my products',
    },
];

export default function RoleSelector({ role, onChange }: Props) {
    return (
        <div className="flex flex-col gap-1.5">
            <p className="text-xs text-site-muted">What brings you here?</p>
            <div className="flex gap-2">
                {OPTIONS.map(({ value, icon: Icon, title, desc }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onChange(value)}
                        className={[
                            'flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition',
                            role === value
                                ? 'border-brand bg-brand/5 text-brand'
                                : 'border-site-border text-site-muted hover:border-brand/40',
                        ].join(' ')}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-semibold">{title}</span>
                        <span className="text-[10px] leading-snug">{desc}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
