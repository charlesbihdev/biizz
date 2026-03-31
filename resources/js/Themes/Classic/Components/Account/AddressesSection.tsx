import { useState }  from 'react';
import { router, useForm } from '@inertiajs/react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { storeAddress, destroyAddress } from '@/actions/App/Http/Controllers/CustomerAccountController';
import { FlashMessages } from './FlashMessages';
import type { Business, CustomerAddress } from './types';

interface AddressesSectionProps {
    addresses: CustomerAddress[];
    business:  Business;
    accent:    string;
}

export function AddressesSection({ addresses, business, accent }: AddressesSectionProps) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        label:          'Home',
        street_address: '',
        city:           '',
        region:         '',
        country:        'Ghana',
        is_default:     false as boolean,
    });

    function submitAddress(e: React.FormEvent) {
        e.preventDefault();
        post(storeAddress.url(business), {
            onSuccess: () => { reset(); setShowForm(false); },
            preserveScroll: true,
        });
    }

    const fields = [
        { label: 'Label',          key: 'label',          placeholder: 'Home, Office…',  required: true  },
        { label: 'Street Address', key: 'street_address', placeholder: '12 Main Street', required: true  },
        { label: 'City',           key: 'city',           placeholder: 'Accra',           required: true  },
        { label: 'Region',         key: 'region',         placeholder: 'Greater Accra',   required: false },
        { label: 'Country',        key: 'country',        placeholder: 'Ghana',           required: true  },
    ] as const;

    return (
        <div className="space-y-4">
            <FlashMessages />
            {addresses.length === 0 && !showForm && (
                <div className="flex flex-col items-center py-10 text-zinc-400">
                    <MapPin className="mb-3 h-10 w-10 opacity-30" />
                    <p className="text-sm">No saved addresses.</p>
                </div>
            )}
            {addresses.map((addr) => (
                <div key={addr.id} className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-zinc-900">{addr.label}</p>
                            {addr.is_default && (
                                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: accent }}>
                                    Default
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-zinc-600">{addr.street_address}</p>
                        <p className="text-sm text-zinc-500">
                            {addr.city}{addr.region ? `, ${addr.region}` : ''}, {addr.country}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.delete(destroyAddress.url({ business, address: addr }), { preserveScroll: true })}
                        className="shrink-0 p-1.5 text-zinc-300 transition hover:text-red-500"
                        aria-label="Delete address"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ))}
            {!showForm && (
                <button type="button" onClick={() => setShowForm(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-200 py-4 text-sm font-medium text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700">
                    <Plus className="h-4 w-4" /> Add new address
                </button>
            )}
            {showForm && (
                <form onSubmit={submitAddress} className="space-y-4 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-zinc-900">New Address</h3>
                    {fields.map(({ label, key, placeholder, required }) => (
                        <div key={key}>
                            <label className="mb-1 block text-sm font-medium text-zinc-700">{label}</label>
                            <input
                                type="text"
                                value={data[key] as string}
                                onChange={(e) => setData(key, e.target.value)}
                                placeholder={placeholder}
                                required={required}
                                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-zinc-400"
                            />
                            {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
                        </div>
                    ))}
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
                        <input type="checkbox" checked={data.is_default} onChange={(e) => setData('is_default', e.target.checked)} className="rounded" />
                        Set as default address
                    </label>
                    <div className="flex gap-3">
                        <button type="submit" disabled={processing}
                            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                            style={{ backgroundColor: accent }}>
                            {processing ? 'Saving…' : 'Save Address'}
                        </button>
                        <button type="button" onClick={() => { reset(); setShowForm(false); }}
                            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50">
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
