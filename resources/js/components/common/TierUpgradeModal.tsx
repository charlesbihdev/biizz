import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, CreditCard, Loader2, Sparkles, Wallet, X } from 'lucide-react';
import { useState } from 'react';
import { useSubscriptionCheckout } from '@/hooks/use-subscription-checkout';
import { useTier } from '@/hooks/use-tier';
import { formatBytes } from '@/lib/utils';
import { pricing as pricingRoute } from '@/routes';
import { useUpgradeModal } from '@/stores/upgrade-modal-store';
import type { FeatureAudience, SubscriptionTier, TierMeta } from '@/types';

/**
 * The single upgrade CTA surface. Called by every Pro pill in the app via
 * the zustand `useUpgradeModal` store. Stays mounted once at the layout
 * level so any subtree can trigger it without prop-drilling.
 *
 * UI/UX intent (ANALYTICS_TIERS.md sections 1.6, 1.7, 11.1):
 * - Personalised headline based on which feature was tapped.
 * - Three-column side-by-side comparison so users can see the full ladder
 *   at a glance instead of just the next step. Anchors Pro Max at the top
 *   and lets Pro feel like the "fair middle" — pricing psychology 101.
 * - Per-tier highlights driven by config (price, marketplace fee, limits)
 *   so re-pricing requires no code edits.
 * - Pro is marked Recommended; the user's current plan is locked into a
 *   "Current plan" pill so they don't accidentally re-pick it.
 *
 * Phase 3 swaps the "Choose Pro" / "Choose Pro Max" CTAs for inline
 * Paystack checkout once subscriptions are live.
 */

const FEATURE_HEADLINES: Record<string, string> = {
    'storefront.no_branding': 'Hide biizz branding from your storefront',
    'products.unlimited': 'Add more products to your store',
    'products.multiple_images': 'Show your products from every angle',
    'storage.larger_digital_files': 'Upload bigger digital files',
    'storage.more_digital_storage': 'Get more storage for your digital products',
    'analytics.compare_periods': 'Compare any time period to spot trends',
    'analytics.product_drilldown': 'Drill into any product\u2019s 90-day curve',
    'analytics.customer_drilldown': 'See exactly who is buying what',
    'analytics.export_csv': 'Export every report as CSV',
    'analytics.email_digest': 'Get a weekly digest delivered to your inbox',
    'analytics.rfm': 'Segment your best, regular, and at-risk buyers',
    'analytics.cohort_retention': 'See which customer cohorts come back',
    'analytics.stockout_forecast': 'Forecast which products will run out next',
    'analytics.threshold_alerts': 'Get alerts when key metrics shift',
};

const DEFAULT_HEADLINE = 'Pick the plan that fits your store';

const TIER_ORDER: SubscriptionTier[] = ['free', 'pro', 'pro_max'];

// Storage line shared across the three bullet builders. Reads the same
// keys the backend writes to `tier.limits` so re-tiering propagates here
// for free.
function storageBullet(m: TierMeta): string {
    const total = m.limits.max_digital_storage_bytes;
    const perFile = m.limits.max_digital_file_bytes;
    const totalLabel = total === null ? 'Unlimited storage' : `${formatBytes(total)} digital storage`;
    const perFileLabel = perFile === null ? 'unlimited file size' : `${formatBytes(perFile)} per file`;
    return `${totalLabel} · ${perFileLabel}`;
}

interface AudienceBullet {
    audience: FeatureAudience;
    text: string;
}

// Per-tier highlight bullets, each tagged with the audience it applies
// to. The modal filters this list by the active business's type so a
// digital seller never sees "biizz badge" copy and a physical seller
// never sees "digital storage" copy. `all` lines render for everyone.
const TIER_BULLETS: Record<SubscriptionTier, (m: TierMeta) => AudienceBullet[]> = {
    free: (m) => [
        { audience: 'all', text: `${m.limits.max_products ?? 'Unlimited'} products` },
        { audience: 'all', text: `${m.limits.max_product_images ?? 'Unlimited'} photo per product` },
        { audience: 'digital', text: storageBullet(m) },
        { audience: 'digital', text: `${m.marketplace_fee_percent}% marketplace fee per sale` },
        { audience: 'physical', text: 'biizz badge always shown on storefront' },
    ],
    pro: (m) => [
        { audience: 'all', text: `${m.limits.max_products ?? 'Unlimited'} products` },
        { audience: 'all', text: `${m.limits.max_product_images ?? 'Unlimited'} photos per product` },
        { audience: 'digital', text: storageBullet(m) },
        { audience: 'digital', text: `${m.marketplace_fee_percent}% marketplace fee per sale` },
        { audience: 'physical', text: 'biizz badge removed from storefront' },
        { audience: 'all', text: 'Insight analytics: drill-downs, channel mix, repeat rate' },
    ],
    pro_max: (m) => [
        { audience: 'all', text: `${m.limits.max_products ?? 'Unlimited'} products` },
        { audience: 'all', text: `${m.limits.max_product_images ?? 'Unlimited'} photos per product` },
        { audience: 'digital', text: storageBullet(m) },
        { audience: 'digital', text: `${m.marketplace_fee_percent}% marketplace fee per sale` },
        { audience: 'all', text: 'Intelligence layer: cohorts, forecasts, exports' },
        { audience: 'all', text: 'Priority technical support' },
    ],
};

function applies(audience: FeatureAudience, businessType: 'physical' | 'digital'): boolean {
    return audience === 'all' || audience === businessType;
}

function formatPrice(amount: number, currency: string): string {
    if (amount === 0) return 'Free';
    return `${currency} ${amount.toLocaleString()}`;
}

export function TierUpgradeModal() {
    const { open, context, close } = useUpgradeModal();
    const { tier, current, label, requiredTier } = useTier();
    const business = usePage().props.business;
    const { start, pending } = useSubscriptionCheckout();
    const [methodStep, setMethodStep] = useState<SubscriptionTier | null>(null);

    if (!open || !current || !tier || !business) return null;

    const businessType = business.business_type;

    const featureTarget = context.feature ? requiredTier(context.feature) : null;
    const headline = context.headline
        ?? (context.feature ? FEATURE_HEADLINES[context.feature] : null)
        ?? DEFAULT_HEADLINE;

    const handleChoose = (target: SubscriptionTier) => {
        if (target === 'free') return;
        setMethodStep(target);
    };

    const handleClose = () => {
        setMethodStep(null);
        close();
    };

    const handleBack = () => setMethodStep(null);

    if (methodStep) {
        return (
            <PaymentMethodStep
                target={methodStep}
                tierLabel={tier.tiers[methodStep]?.label ?? methodStep}
                price={formatPrice(tier.tiers[methodStep]?.price ?? 0, tier.currency)}
                pending={pending}
                onChoose={(mode) => start(methodStep, mode)}
                onBack={handleBack}
                onClose={handleClose}
            />
        );
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-8"
        >
            <button
                type="button"
                aria-label="Close"
                onClick={handleClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <div className="relative my-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close"
                    className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-site-muted transition hover:bg-site-surface hover:text-site-fg"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Hero */}
                <div className="bg-linear-to-br from-brand to-brand/80 px-6 py-7 text-white sm:px-8">
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur">
                        <Sparkles className="h-3 w-3" />
                        Upgrade
                    </div>
                    <h2
                        id="upgrade-modal-title"
                        className="text-xl font-bold leading-tight sm:text-2xl"
                    >
                        {headline}
                    </h2>
                    <p className="mt-1 text-sm text-white/85">
                        You&rsquo;re on {label}. Compare plans below.
                    </p>
                </div>

                {/* 3-column comparison */}
                <div className="grid grid-cols-1 gap-3 px-4 py-5 sm:grid-cols-3 sm:px-6 sm:py-6">
                    {TIER_ORDER.map((key) => {
                        const meta = tier.tiers[key];
                        if (!meta) return null;

                        const isCurrent = key === current;
                        const isRecommended = key === 'pro';
                        const isFeatureTarget = key === featureTarget;
                        const bullets = TIER_BULLETS[key](meta).filter((b) =>
                            applies(b.audience, businessType),
                        );

                        return (
                            <article
                                key={key}
                                className={`relative flex flex-col rounded-2xl border p-4 ${
                                    isRecommended
                                        ? 'border-brand bg-brand/5 shadow-sm'
                                        : isFeatureTarget && !isCurrent
                                            ? 'border-brand/40 bg-white'
                                            : 'border-site-border bg-white'
                                }`}
                            >
                                {isRecommended && !isCurrent && (
                                    <div className="absolute -top-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow">
                                        <Sparkles className="h-2.5 w-2.5" />
                                        Recommended
                                    </div>
                                )}
                                {isCurrent && (
                                    <div className="absolute -top-2 left-1/2 inline-flex -translate-x-1/2 items-center rounded-full bg-site-fg px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow">
                                        Current plan
                                    </div>
                                )}

                                <header>
                                    <h3 className={`text-base font-bold ${isRecommended ? 'text-brand' : 'text-site-fg'}`}>
                                        {meta.label}
                                    </h3>
                                    <p className="mt-2">
                                        <span className="text-2xl font-bold text-site-fg">
                                            {formatPrice(meta.price, tier.currency)}
                                        </span>
                                        {meta.price > 0 && (
                                            <span className="text-xs text-site-muted">
                                                {' '}/ month
                                            </span>
                                        )}
                                    </p>
                                </header>

                                <ul className="my-4 flex flex-1 flex-col gap-1.5">
                                    {bullets.map((line) => (
                                        <li
                                            key={line.text}
                                            className="flex items-start gap-1.5 text-xs text-site-fg"
                                        >
                                            <Check
                                                className={`mt-0.5 h-3 w-3 shrink-0 ${
                                                    isRecommended ? 'text-brand' : 'text-emerald-600'
                                                }`}
                                                strokeWidth={3}
                                            />
                                            <span>{line.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                {isCurrent ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="block w-full cursor-not-allowed rounded-full border border-site-border bg-white px-3 py-2 text-xs font-semibold text-site-muted"
                                    >
                                        You&rsquo;re here
                                    </button>
                                ) : key === 'free' ? null : (
                                    <button
                                        type="button"
                                        onClick={() => handleChoose(key)}
                                        disabled={pending !== null}
                                        className={`group flex w-full items-center justify-center gap-1 rounded-full px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                            isRecommended
                                                ? 'bg-brand text-white hover:bg-brand-hover'
                                                : 'bg-site-fg text-white hover:bg-site-fg/90'
                                        }`}
                                    >
                                        {pending === key ? (
                                            <>
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Redirecting
                                            </>
                                        ) : (
                                            <>
                                                Choose {meta.label}
                                                <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </article>
                        );
                    })}
                </div>

                {/* Footer hint */}
                <div className="border-t border-site-border px-6 py-3 text-center text-[11px] text-site-muted sm:px-8">
                    See the full feature matrix on the{' '}
                    <button
                        type="button"
                        onClick={() => {
                            handleClose();
                            router.visit(pricingRoute().url);
                        }}
                        className="font-semibold text-brand hover:underline"
                    >
                        pricing page
                    </button>
                    . Cancel any time, your data stays yours.
                </div>
            </div>
        </div>
    );
}

/**
 * Inline payment-method screen shown after the user picks a tier. Card is
 * the primary CTA — Paystack auto-renews monthly, no missed deadlines —
 * with momo/bank as an equally functional secondary option for users
 * without a card.
 */
function PaymentMethodStep({
    target,
    tierLabel,
    price,
    pending,
    onChoose,
    onBack,
    onClose,
}: {
    target: SubscriptionTier;
    tierLabel: string;
    price: string;
    pending: SubscriptionTier | null;
    onChoose: (mode: 'auto' | 'manual') => void;
    onBack: () => void;
    onClose: () => void;
}) {
    const isPending = pending !== null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-method-title"
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-8"
        >
            <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <div className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-site-muted transition hover:bg-site-surface hover:text-site-fg"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="px-6 py-7 sm:px-8">
                    <button
                        type="button"
                        onClick={onBack}
                        className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-site-muted transition hover:text-site-fg"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to plans
                    </button>

                    <h2 id="upgrade-method-title" className="text-xl font-bold text-site-fg">
                        How would you like to pay?
                    </h2>
                    <p className="mt-1 text-sm text-site-muted">
                        {tierLabel} plan, {price} per month.
                    </p>

                    <div className="mt-6 space-y-3">
                        <button
                            type="button"
                            onClick={() => onChoose('auto')}
                            disabled={isPending}
                            className="group flex w-full items-start gap-3 rounded-2xl border-2 border-brand bg-brand/5 p-4 text-left transition hover:bg-brand/10 disabled:opacity-60"
                        >
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                                <CreditCard className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-site-fg">Pay with card</p>
                                    <span className="rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                                        Recommended
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-site-muted">
                                    Auto-renews monthly. Set it once and never miss a deadline. Cancel any time from your billing page.
                                </p>
                            </div>
                            {pending === target ? (
                                <Loader2 className="mt-1 h-4 w-4 shrink-0 animate-spin text-brand" />
                            ) : (
                                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand transition group-hover:translate-x-0.5" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => onChoose('manual')}
                            disabled={isPending}
                            className="group flex w-full items-start gap-3 rounded-2xl border border-site-border bg-white p-4 text-left transition hover:bg-site-surface disabled:opacity-60"
                        >
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-site-surface text-site-fg">
                                <Wallet className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-site-fg">Pay with momo or bank</p>
                                <p className="mt-1 text-xs text-site-muted">
                                    One month at a time. We&rsquo;ll remind you before it expires so you can renew with momo, bank, or card.
                                </p>
                            </div>
                            {pending === target ? (
                                <Loader2 className="mt-1 h-4 w-4 shrink-0 animate-spin text-site-fg" />
                            ) : (
                                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-site-fg transition group-hover:translate-x-0.5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
