import { useState } from 'react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { FlashMessages } from './FlashMessages';
import { AddressFormDialog } from './AddressFormDialog';
import { DeleteAddressDialog } from './DeleteAddressDialog';
import type { Business, CustomerAddress } from './types';

interface AddressesSectionProps {
    addresses: CustomerAddress[];
    business:  Business;
    accent:    string;
}

export function AddressesSection({ addresses, business, accent }: AddressesSectionProps) {
    const [formOpen, setFormOpen]           = useState(false);
    const [editing, setEditing]             = useState<CustomerAddress | null>(null);
    const [deleteTarget, setDeleteTarget]   = useState<CustomerAddress | null>(null);

    function openAdd() {
        setEditing(null);
        setFormOpen(true);
    }

    function openEdit(addr: CustomerAddress) {
        setEditing(addr);
        setFormOpen(true);
    }

    return (
        <div className="space-y-4">
            <FlashMessages />

            {addresses.length === 0 && (
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
                    <div className="flex shrink-0 items-center gap-1">
                        <button
                            type="button"
                            onClick={() => openEdit(addr)}
                            className="p-1.5 text-zinc-300 transition hover:text-zinc-600"
                            aria-label="Edit address"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(addr)}
                            className="p-1.5 text-zinc-300 transition hover:text-red-500"
                            aria-label="Delete address"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={openAdd}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-200 py-4 text-sm font-medium text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700"
            >
                <Plus className="h-4 w-4" /> Add new address
            </button>

            <AddressFormDialog
                business={business}
                address={editing}
                open={formOpen}
                onOpenChange={setFormOpen}
                accent={accent}
            />

            {deleteTarget && (
                <DeleteAddressDialog
                    business={business}
                    address={deleteTarget}
                    open={deleteTarget !== null}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                />
            )}
        </div>
    );
}
