import { router, useForm } from '@inertiajs/react';
import { CheckCircle2, Loader2, LoaderCircle, Unplug } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import InputError from '@/components/input-error';
import { destroy, setDefault, store } from '@/routes/businesses/payments';
import type { Business } from '@/types';

type Props = {
    business: Business;
    providerId: string;
    label: string;
    regions: string[];
    connected: boolean;
    hasClientId?: boolean;
    isDefault: boolean;
};

export function ProviderCard({ business, providerId, label, regions, connected, hasClientId, isDefault }: Props) {
    const b = { business: business.slug };
    const needsClientId = providerId === 'junipay';

    const { data, setData, post, processing: saving, errors, reset } = useForm({
        provider: providerId,
        key: '',
        client_id: '',
    });
    const [disconnecting, setDisconnecting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [settingDefault, setSettingDefault] = useState(false);

    const handleSetDefault = () => {
        if (isDefault) return;

        setSettingDefault(true);
        router.visit(setDefault(b).url, {
            method: 'patch',
            data: { provider: providerId },
            preserveScroll: true,
            onFinish: () => setSettingDefault(false),
        });
    };

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.key.trim()) return;
        if (needsClientId && !data.client_id.trim()) return;

        post(store(b).url, {
            preserveScroll: true,
            onSuccess: () => reset('key', 'client_id'),
        });
    };

    const handleDisconnect = () => {
        setDisconnecting(true);
        router.visit(destroy({ ...b, provider: providerId }).url, {
            method: 'delete',
            preserveScroll: true,
            onFinish: () => {
                setDisconnecting(false);
                setConfirmOpen(false);
            },
        });
    };

    return (
        <div
            className={`rounded-xl border bg-white p-5 transition ${isDefault ? 'border-brand ring-1 ring-brand/20' : 'border-site-border'}`}
        >
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex-1">
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
                        onClick={() => setConfirmOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                        <Unplug className="h-3 w-3" />
                        Disconnect
                    </button>
                )}
            </div>

            {!connected ? (
                <fieldset disabled={saving} className="contents">
                    <form onSubmit={handleConnect} className="flex flex-col gap-3">
                        {needsClientId && (
                            <div>
                                <label className="mb-1 block text-xs font-medium text-site-muted">Client ID</label>
                                <input
                                    type="text"
                                    value={data.client_id}
                                    onChange={(e) => setData('client_id', e.target.value)}
                                    placeholder="Your Junipay client ID"
                                    className="w-full rounded-lg border border-site-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50"
                                />
                                <InputError message={errors.client_id} />
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-xs font-medium text-site-muted">Secret Key</label>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={data.key}
                                    onChange={(e) => setData('key', e.target.value)}
                                    placeholder="Paste your secret key..."
                                    className="min-w-0 flex-1 rounded-lg border border-site-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={saving || !data.key.trim() || (needsClientId && !data.client_id.trim())}
                                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-60"
                                >
                                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                                    {saving ? 'Connecting...' : 'Connect'}
                                </button>
                            </div>
                            <InputError message={errors.key} />
                        </div>
                    </form>
                </fieldset>
            ) : (
                <button
                    type="button"
                    onClick={handleSetDefault}
                    disabled={isDefault || settingDefault}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                        isDefault
                            ? 'border-brand bg-brand/5 cursor-default'
                            : 'border-site-border cursor-pointer hover:bg-zinc-50'
                    } disabled:opacity-70`}
                >
                    {settingDefault ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand" />
                    ) : (
                        <input
                            type="radio"
                            name="default_payment_provider"
                            checked={isDefault}
                            readOnly
                            className="h-4 w-4 accent-brand pointer-events-none"
                        />
                    )}
                    <div>
                        <p className="text-sm font-medium text-site-fg">
                            {settingDefault ? 'Saving...' : isDefault ? 'Default provider' : 'Set as default'}
                        </p>
                        <p className="text-xs text-site-muted">
                            {isDefault
                                ? 'Customers will pay through this provider.'
                                : 'Click to use this for checkout payments.'}
                        </p>
                    </div>
                </button>
            )}

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Disconnect {label}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your API keys will be permanently removed. You'll need to re-enter them to accept payments through {label} again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDisconnect}
                            disabled={disconnecting}
                            className="inline-flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 disabled:opacity-60"
                        >
                            {disconnecting && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
                            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
