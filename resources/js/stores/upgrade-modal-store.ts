import { create } from 'zustand';

/**
 * Tiny global store driving the tier upgrade modal. Any Pro/Pro Max pill in
 * the app can call `useUpgradeModal.getState().open(...)` to surface the
 * modal with feature-specific context.
 *
 * The reason for a global store (vs. context provider): Pro pills are
 * sprinkled across many unrelated subtrees (settings, products, image
 * uploader, sidebar). A single store keeps each call site a one-liner.
 */

interface UpgradeContext {
    /** Optional feature key whose lock triggered the modal — drives copy. */
    feature?: string;
    /** Optional manual headline override. */
    headline?: string;
}

interface UpgradeModalState {
    open: boolean;
    context: UpgradeContext;
    show: (context?: UpgradeContext) => void;
    close: () => void;
}

export const useUpgradeModal = create<UpgradeModalState>((set) => ({
    open: false,
    context: {},
    show: (context = {}) => set({ open: true, context }),
    close: () => set({ open: false, context: {} }),
}));
