import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

export function PasswordInput({
    value,
    onChange,
    autoComplete,
    placeholder = '••••••••',
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    autoComplete?: string;
    placeholder?: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                required
                placeholder={placeholder}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
}

export function SubmitButton({
    accent,
    processing,
    children,
}: {
    accent: string;
    processing: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            type="submit"
            disabled={processing}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: accent }}
        >
            {processing ? 'Please wait…' : children}
        </button>
    );
}
