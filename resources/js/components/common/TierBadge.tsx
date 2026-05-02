import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useTier } from '@/hooks/use-tier';
import { useUpgradeModal } from '@/stores/upgrade-modal-store';

/**
 * Header tier indicator. Surfaces the active business's plan and a
 * contextual upgrade trigger. Renders null when no business is in scope
 * (auth pages, marketing pages) so the header collapses cleanly.
 *
 * Free:    muted pill + solid brand "Upgrade" CTA (conversion focus).
 * Pro:     brand-tinted pill + quiet "Upgrade to Pro Max" link.
 * Pro Max: solid brand pill with sparkle, no CTA (top of ladder).
 */
export function TierBadge() {
    const { current, label } = useTier();
    const showUpgrade = useUpgradeModal((s) => s.show);

    if (!current || !label) {
        return null;
    }

    if (current === 'pro_max') {
        return (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                {label} Plan
            </div>
        );
    }

    if (current === 'pro') {
        return (
            <div className="inline-flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
                    {label} Plan
                </span>
                <button
                    type="button"
                    onClick={() => showUpgrade()}
                    className="hidden text-xs font-semibold text-site-muted transition hover:text-brand sm:inline-flex sm:items-center sm:gap-0.5"
                >
                    Upgrade to Pro Max
                    <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
                </button>
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-site-surface px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-site-muted ring-1 ring-inset ring-site-border">
                {label} Plan
            </span>
            <button
                type="button"
                onClick={() => showUpgrade()}
                className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white shadow-sm transition hover:bg-brand-hover"
            >
                <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                <span className="hidden sm:inline">Upgrade</span>
                <span className="sm:hidden">Pro</span>
            </button>
        </div>
    );
}
