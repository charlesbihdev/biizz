import { Sparkles } from 'lucide-react';
import { cn, formatPrice, formatShortDate } from '@/lib/utils';
import type { SubscriptionStatus, SubscriptionTier, TierMeta } from '@/types';
import { UpgradeButton } from './UpgradeButton';
import { CancelPlanDialog } from './CancelPlanDialog';

interface Props {
    current: SubscriptionTier;
    label: string;
    meta: TierMeta | null;
    currency: string;
    status: SubscriptionStatus;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
}

export function CurrentPlanCard({
    current,
    label,
    meta,
    currency,
    status,
    currentPeriodEnd,
    cancelAtPeriodEnd,
}: Props) {
    const isFree = current === 'free';
    const price = meta?.price ?? 0;
    const tagline = meta?.tagline ?? '';

    return (
        <section className="mb-6 overflow-hidden rounded-3xl border border-site-border bg-white">
            <div
                className={cn(
                    'px-6 py-5 sm:px-8',
                    isFree
                        ? 'border-b border-site-border bg-site-surface'
                        : 'border-b border-brand/20 bg-linear-to-br from-brand to-brand/80 text-white',
                )}
            >
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p
                            className={cn(
                                'text-[10px] font-bold uppercase tracking-widest',
                                isFree ? 'text-site-muted' : 'text-white/85',
                            )}
                        >
                            Current plan
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                            {!isFree && <Sparkles className="h-5 w-5 text-white" />}
                            <h2 className={cn('text-2xl font-bold', isFree ? 'text-site-fg' : 'text-white')}>
                                {label}
                            </h2>
                        </div>
                        <p className={cn('mt-1 text-sm', isFree ? 'text-site-muted' : 'text-white/85')}>{tagline}</p>
                    </div>

                    <div className="text-right">
                        <p className={cn('text-2xl font-bold', isFree ? 'text-site-fg' : 'text-white')}>
                            {formatPrice(price, currency)}
                        </p>
                        {!isFree && <p className="text-xs text-white/85">/ month</p>}
                    </div>
                </div>
            </div>

            <div className="px-6 py-5 sm:px-8">
                {isFree ? <FreeBody /> : <PaidBody status={status} renewsOn={currentPeriodEnd} cancelAtPeriodEnd={cancelAtPeriodEnd} />}
            </div>
        </section>
    );
}

function FreeBody() {
    return (
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
                <p className="text-sm font-medium text-site-fg">You&rsquo;re on the Free plan</p>
                <p className="mt-1 text-xs text-site-muted">
                    Upgrade to unlock unlimited products, deeper analytics, and remove biizz branding.
                </p>
            </div>
            <UpgradeButton target="pro" label="Upgrade to Pro" />
        </div>
    );
}

function PaidBody({
    status,
    renewsOn,
    cancelAtPeriodEnd,
}: {
    status: SubscriptionStatus;
    renewsOn: string | null;
    cancelAtPeriodEnd: boolean;
}) {
    const statusLabel =
        status === 'past_due'
            ? { text: 'Past due', tone: 'text-red-600' }
            : cancelAtPeriodEnd
              ? { text: 'Cancels at period end', tone: 'text-amber-600' }
              : { text: 'Active', tone: 'text-emerald-600' };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-site-muted">Status</p>
                <p className={cn('mt-1 text-sm font-semibold', statusLabel.tone)}>{statusLabel.text}</p>
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-site-muted">
                    {cancelAtPeriodEnd ? 'Plan ends on' : 'Renews on'}
                </p>
                <p className="mt-1 text-sm font-semibold text-site-fg">{formatShortDate(renewsOn)}</p>
            </div>
            <div className="flex items-end justify-end">
                {cancelAtPeriodEnd ? null : <CancelPlanDialog />}
            </div>
        </div>
    );
}
