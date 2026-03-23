import { router } from '@inertiajs/react';
import { CheckCircle2, Loader2, Unplug } from 'lucide-react';
import { useState } from 'react';
import { destroy, store } from '@/routes/businesses/payments';
import type { Business } from '@/types';

type Props = {
    business: Business;
    providerId: string;
    label: string;
    regions: string[];
    connected: boolean;
};

export function ProviderCard({ business, providerId, label, regions, connected }: Props) {
    const b = { business: business.slug };
    const [key, setKey] = useState('');
    const [saving, setSaving] = useState(false);

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();

        if (!key.trim()) {
            return;
        }

        setSaving(true);

        router.visit(store(b).url, {
            method: 'post',
            data: { provider: providerId, key },
            preserveScroll: true,
            onFinish: () => setSaving(false),
            onSuccess: () => setKey(''),
        });
    };

    const handleDisconnect = () => {
        if (!confirm(`Disconnect ${label}?`)) {
            return;
        }

        router.visit(destroy({ ...b, provider: providerId }).url, {
            method: 'delete',
            preserveScroll: true,
        });
    };

    return (
        <div className="rounded-xl border border-site-border bg-white p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-site-fg">{label}</p>
                        {connected && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                <CheckCircle2 className="h-3 w-3" /> Connected
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-xs text-site-muted">{regions.join(', ')}</p>
                </div>

                {connected && (
                    <button
                        type="button"
                        onClick={handleDisconnect}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                        <Unplug className="h-3 w-3" />
                        Disconnect
                    </button>
                )}
            </div>

            {!connected && (
                <form onSubmit={handleConnect} className="flex gap-2">
                    <input
                        type="password"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="Paste your secret key..."
                        className="min-w-0 flex-1 rounded-lg border border-site-border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                    />
                    <button
                        type="submit"
                        disabled={saving || !key.trim()}
                        className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-60"
                    >
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Connect
                    </button>
                </form>
            )}
        </div>
    );
}
