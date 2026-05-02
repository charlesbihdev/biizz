import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpgradeModal } from '@/stores/upgrade-modal-store';
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
 * "Buy a plan" trigger. Opens the shared TierUpgradeModal so the user
 * picks card-vs-momo on the second step instead of being shoved into
 * checkout immediately. The `target` prop only seeds copy (the modal
 * still shows the full ladder); the user picks tier + method there.
 */
export function UpgradeButton({
    label,
    variant = 'primary',
    fullWidth = false,
    showArrow = true,
    className,
}: Props) {
    const show = useUpgradeModal((s) => s.show);

    const styles =
        variant === 'primary'
            ? 'bg-brand text-white hover:bg-brand-hover'
            : variant === 'secondary'
              ? 'bg-site-fg text-white hover:bg-site-fg/90'
              : 'border border-site-border bg-white text-site-fg hover:bg-site-surface';

    return (
        <button
            type="button"
            onClick={() => show()}
            className={cn(
                'group inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60',
                styles,
                fullWidth && 'w-full',
                className,
            )}
        >
            {label ?? 'Upgrade'}
            {showArrow && <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />}
        </button>
    );
}
