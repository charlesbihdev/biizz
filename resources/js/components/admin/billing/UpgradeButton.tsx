import { ArrowRight, Loader2 } from 'lucide-react';
import { useSubscriptionCheckout } from '@/hooks/use-subscription-checkout';
import { cn } from '@/lib/utils';
import type { SubscriptionTier } from '@/types';

interface Props {
    target: SubscriptionTier;
    label?: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    fullWidth?: boolean;
    showArrow?: boolean;
    className?: string;
}

/**
 * The single "buy this plan" button. Used by the upgrade modal, the
 * billing page hero, and the pricing-page CTAs so they share spinner state
 * and post target. Variants keep the visual rhythm consistent across
 * surfaces without each call site re-spinning button styling.
 */
export function UpgradeButton({
    target,
    label,
    variant = 'primary',
    fullWidth = false,
    showArrow = true,
    className,
}: Props) {
    const { start, pending, isReady } = useSubscriptionCheckout();
    const isLoading = pending === target;
    const disabled = !isReady || pending !== null;

    const styles =
        variant === 'primary'
            ? 'bg-brand text-white hover:bg-brand-hover'
            : variant === 'secondary'
              ? 'bg-site-fg text-white hover:bg-site-fg/90'
              : 'border border-site-border bg-white text-site-fg hover:bg-site-surface';

    return (
        <button
            type="button"
            onClick={() => start(target)}
            disabled={disabled}
            className={cn(
                'group inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60',
                styles,
                fullWidth && 'w-full',
                className,
            )}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Redirecting
                </>
            ) : (
                <>
                    {label ?? 'Upgrade'}
                    {showArrow && <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />}
                </>
            )}
        </button>
    );
}
