import { router } from '@inertiajs/react';
import { useState } from 'react';
import { store } from '@/routes/storefront/checkout';
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

/**
 * Cart is intentionally NOT cleared here. The backend responds with
 * Inertia::location() (external redirect to the payment provider),
 * so the customer leaves the page. Cart is only cleared on the
 * CheckoutSuccess page after payment is verified as paid.
 */
export function useCheckout(businessSlug: string): UseCheckoutReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors]            = useState<Record<string, string>>({});
    const items                          = useCartStore((s) => s.items);

    const submitOrder = (data: CheckoutData) => {
        setIsSubmitting(true);
        setErrors({});

        router.post(store(businessSlug), {
            ...data,
            items: items as unknown as Array<Record<string, string | number | boolean | null>>,
        }, {
            onError: (errs) => {
                setErrors(errs);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return { submitOrder, isSubmitting, errors };
}
