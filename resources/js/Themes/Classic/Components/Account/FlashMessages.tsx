import { usePage } from '@inertiajs/react';

export function FlashMessages() {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    return (
        <>
            {flash?.success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {flash.error}
                </div>
            )}
        </>
    );
}
