import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types/business';

interface CartState {
    items:          CartItem[];
    addToCart:      (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart:      () => void;
    total:          number;
    itemCount:      number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addToCart: (product) =>
                set((state) => {
                    const existing = state.items.find((i) => i.id === product.id);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
                            ),
                        };
                    }
                    return { items: [...state.items, { ...product, quantity: 1 }] };
                }),

            removeFromCart: (id) =>
                set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

            updateQuantity: (id, quantity) =>
                set((state) => {
                    if (quantity <= 0) {
                        return { items: state.items.filter((i) => i.id !== id) };
                    }
                    return { items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)) };
                }),

            clearCart: () => set({ items: [] }),

            get total() {
                return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
            },

            get itemCount() {
                return get().items.reduce((sum, i) => sum + i.quantity, 0);
            },
        }),
        { name: 'biizz-cart' },
    ),
);
