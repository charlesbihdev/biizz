import { useState } from 'react';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
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
import { destroyAddress } from '@/actions/App/Http/Controllers/CustomerAccountController';
import type { Business, CustomerAddress } from './types';

interface Props {
    business:     Business;
    address:      CustomerAddress;
    open:         boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteAddressDialog({ business, address, open, onOpenChange }: Props) {
    const [deleting, setDeleting] = useState(false);

    const handleConfirm = () => {
        setDeleting(true);
        router.visit(destroyAddress.url({ business, address }), {
            method: 'delete',
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{address.label}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This address will be permanently removed and cannot be recovered.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={deleting}
                        className="inline-flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 disabled:opacity-60"
                    >
                        {deleting && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
