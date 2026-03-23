import { router } from '@inertiajs/react';
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
import { destroy } from '@/routes/businesses/products';
import type { Business, Product } from '@/types';

type Props = {
    business: Business;
    product: Product;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function DeleteProductDialog({ business, product, open, onOpenChange }: Props) {
    const b = { business: business.slug };

    const handleConfirm = () => {
        router.visit(destroy({ ...b, product: product.id }).url, { method: 'delete' });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{product.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This product will be permanently removed from your storefront and cannot be recovered.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
