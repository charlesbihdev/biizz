import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types/business';

interface CartState {
    items:          CartItem[];
    total:          number;
    itemCount:      number;
    addToCart:      (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart:      () => void;
}

function computeTotals(items: CartItem[]) {
    return {
        total:     items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    };
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items:     [],
            total:     0,
            itemCount: 0,

            addToCart: (product) =>
                set((state) => {
                    const existing = state.items.find((i) => i.id === product.id);
                    const items = existing
                        ? state.items.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
                        : [...state.items, { ...product, quantity: 1 }];
                    return { items, ...computeTotals(items) };
                }),

            removeFromCart: (id) =>
                set((state) => {
                    const items = state.items.filter((i) => i.id !== id);
                    return { items, ...computeTotals(items) };
                }),

            updateQuantity: (id, quantity) =>
                set((state) => {
                    const items = quantity <= 0
                        ? state.items.filter((i) => i.id !== id)
                        : state.items.map((i) => (i.id === id ? { ...i, quantity } : i));
                    return { items, ...computeTotals(items) };
                }),

            clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
        }),
        { name: 'biizz-cart' },
    ),
);
