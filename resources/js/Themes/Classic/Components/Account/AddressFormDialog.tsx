import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { storeAddress, updateAddress } from '@/actions/App/Http/Controllers/CustomerAccountController';
import type { Business, CustomerAddress } from './types';

interface Props {
    business:      Business;
    address:       CustomerAddress | null; // null = adding new
    open:          boolean;
    onOpenChange:  (open: boolean) => void;
    accent:        string;
}

const blank = {
    label:          'Home',
    street_address: '',
    city:           '',
    region:         '',
    country:        'Ghana',
    is_default:     false as boolean,
};

const fields = [
    { label: 'Label',          key: 'label'          as const, placeholder: 'Home, Office…'  },
    { label: 'Street Address', key: 'street_address' as const, placeholder: '12 Main Street' },
    { label: 'City',           key: 'city'           as const, placeholder: 'Accra'           },
    { label: 'Region / State', key: 'region'         as const, placeholder: 'Greater Accra'  },
    { label: 'Country',        key: 'country'        as const, placeholder: 'Ghana'           },
];

export function AddressFormDialog({ business, address, open, onOpenChange, accent }: Props) {
    const { data, setData, post, patch, processing, errors, reset } = useForm(blank);

    useEffect(() => {
        if (open) {
            if (address) {
                setData({
                    label:          address.label,
                    street_address: address.street_address,
                    city:           address.city,
                    region:         address.region ?? '',
                    country:        address.country,
                    is_default:     address.is_default,
                });
            } else {
                reset();
            }
        }
    }, [open, address?.id]);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (address) {
            patch(updateAddress.url({ business, address }), {
                preserveState:  true,
                preserveScroll: true,
                only:           ['addresses', 'errors', 'flash'],
                onSuccess: () => onOpenChange(false),
            });
        } else {
            post(storeAddress.url(business), {
                preserveState:  true,
                preserveScroll: true,
                only:           ['addresses', 'errors', 'flash'],
                onSuccess: () => onOpenChange(false),
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{address ? 'Edit Address' : 'New Address'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <label className="mb-1 block text-sm font-medium text-zinc-700">{label}</label>
                            <input
                                type="text"
                                value={data[key] as string}
                                onChange={(e) => setData(key, e.target.value)}
                                placeholder={placeholder}
                                required
                                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-zinc-400"
                            />
                            {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
                        </div>
                    ))}

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
                        <input
                            type="checkbox"
                            checked={data.is_default}
                            onChange={(e) => setData('is_default', e.target.checked)}
                            className="rounded"
                        />
                        Set as default address
                    </label>

                    <DialogFooter>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:flex-none sm:px-6"
                            style={{ backgroundColor: accent }}
                        >
                            {processing ? 'Saving…' : address ? 'Update Address' : 'Save Address'}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
