import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useCartStore } from '@/stores/cartStore';

interface CheckoutData {
    customer_name:  string;
    customer_email: string;
    customer_phone: string;
}

interface UseCheckoutReturn {
    submitOrder:  (data: CheckoutData) => void;
    isSubmitting: boolean;
    errors:       Record<string, string>;
}

export function useCheckout(businessSlug: string): UseCheckoutReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors]            = useState<Record<string, string>>({});
    const { items, clearCart }           = useCartStore();

    const submitOrder = (data: CheckoutData) => {
        setIsSubmitting(true);
        setErrors({});

        router.post(`/s/${businessSlug}/checkout`, {
            ...data,
            items: items as unknown as Record<string, unknown>[],
        }, {
            onError: (errs) => {
                setErrors(errs);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                clearCart();
                setIsSubmitting(false);
            },
        });
    };

    return { submitOrder, isSubmitting, errors };
}
