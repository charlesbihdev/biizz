import { useState, useCallback, useMemo } from 'react';
import type { CartItem } from '@/types/business';

interface UseCartReturn {
    items:            CartItem[];
    addToCart:        (item: CartItem) => void;
    removeFromCart:   (id: number) => void;
    updateQuantity:   (id: number, quantity: number) => void;
    clearCart:        () => void;
    total:            number;
    itemCount:        number;
}

export function useCart(initialItems: CartItem[] = []): UseCartReturn {
    const [items, setItems] = useState<CartItem[]>(initialItems);

    const addToCart = useCallback((product: CartItem) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((id: number) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);

    const updateQuantity = useCallback((id: number, quantity: number) => {
        if (quantity <= 0) {
            setItems((prev) => prev.filter((i) => i.id !== id));
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
        );
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const total = useMemo(
        () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        [items],
    );

    const itemCount = useMemo(
        () => items.reduce((sum, i) => sum + i.quantity, 0),
        [items],
    );

    return { items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount };
}
