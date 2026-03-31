import { useState } from 'react';
import type { CustomerAddress } from '@/types/business';

export function useCustomerAddresses(addresses: CustomerAddress[] = []) {
    const defaultAddress = addresses.find(a => a.is_default) ?? addresses[0] ?? null;

    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(defaultAddress?.id ?? null);

    const selectedAddress = addresses.find(a => a.id === selectedAddressId) ?? null;

    return {
        addresses,
        hasAddresses: addresses.length > 0,
        selectedAddressId,
        setSelectedAddressId,
        selectedAddress,
        defaultAddress,
    };
}
