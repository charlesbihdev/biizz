import { Head } from '@inertiajs/react';
import { Check, Sparkles } from 'lucide-react';
import LandingFooter from '@/components/Landing/LandingFooter';
import LandingNav from '@/components/Landing/LandingNav';
import { PlanCTA } from '@/components/pricing/PlanCTA';
import { formatBytes } from '@/lib/utils';
import type { FeatureAudience, SubscriptionTier, TierMeta } from '@/types';

type SerializedTierMeta = TierMeta & {
    rank: 0 | 1 | 2;
};

type Props = {
    currency: string;
    tiers: Record<SubscriptionTier, SerializedTierMeta>;
    features: Record<string, SubscriptionTier>;
};

const TIER_ORDER: SubscriptionTier[] = ['free', 'pro', 'pro_max'];

interface AudienceLine {
    audience: FeatureAudience;
    text: string;
}

// Tier card bullets are tagged with the audience they apply to. Universal
// (`all`) lines render first; the audience-specific lines fall under a
// small "If you sell physical/digital products" label so a visitor reads
// the section that fits their model and skims past the rest.
const TIER_HIGHLIGHTS: Record<SubscriptionTier, AudienceLine[]> = {
    free: [
        { audience: 'all', text: 'Sell your first products online' },
        { audience: 'all', text: 'Accept payments through Paystack and Junipay' },
        { audience: 'all', text: 'Operational stats on every dashboard' },
        { audience: 'all', text: '30-day analytics overview' },
        { audience: 'physical', text: 'Storefront with the biizz badge' },
        { audience: 'digital', text: '50 MB digital file storage, 10 MB max per file' },
    ],
    pro: [
        { audience: 'all', text: 'Everything in Free, plus:' },
        { audience: 'all', text: 'Compare any two periods to spot trends' },
        { audience: 'all', text: 'Per-product and per-customer drill-downs' },
        { audience: 'all', text: 'Channel attribution (web vs WhatsApp)' },
        { audience: 'all', text: 'Repeat customer rate and new-vs-returning split' },
        { audience: 'physical', text: 'Hide biizz branding from your storefront' },
        { audience: 'digital', text: '10 GB digital file storage, no per-file size limit' },
    ],
    pro_max: [
        { audience: 'all', text: 'Everything in Pro, plus:' },
        { audience: 'all', text: 'Export every report as CSV' },
        { audience: 'all', text: 'Weekly email digest, automated' },
        { audience: 'all', text: 'Custom period comparison (any window vs any window)' },
        { audience: 'all', text: 'Saved views and goal tracking' },
        { audience: 'all', text: 'RFM segmentation and cohort retention' },
        { audience: 'all', text: 'Cross-business analytics' },
        { audience: 'all', text: 'Priority technical support' },
        { audience: 'all', text: 'Custom branding & extensions on request' },
        { audience: 'physical', text: 'Stockout forecast and threshold alerts' },
        { audience: 'digital', text: '50 GB digital file storage, no per-file size limit' },
    ],
};

const AUDIENCE_HEADING: Record<Exclude<FeatureAudience, 'all'>, string> = {
    physical: 'If you sell physical products',
    digital: 'If you sell digital products',
};

type MatrixRow = {
    label: string;
    audience: FeatureAudience;
    free: string | boolean;
    pro: string | boolean;
    pro_max: string | boolean;
};

type MatrixSection = {
    heading: string;
    rows: MatrixRow[];
};

// Build the comparison matrix from the tier metadata so numeric rows stay
// in lock-step with `config/biizz.php`. Sectioned by audience so a visitor
// can self-orient: catalog/analytics first (universal), then business-type
// specific blocks. Phase 5 will replace the manual analytics booleans with
// a derived check against `features`.
function buildMatrix(tiers: Props['tiers']): MatrixSection[] {
    const fmtLimit = (v: number | null) => (v === null ? 'Unlimited' : v.toString());
    const fmtBytes = (v: number | null) => (v === null ? 'Unlimited' : formatBytes(v));
    const fmtPerFile = (v: number | null) => (v === null ? 'Unlimited' : `${formatBytes(v)} max`);

    return [
        {
            heading: 'Catalog',
            rows: [
                {
                    label: 'Products',
                    audience: 'all',
                    free: fmtLimit(tiers.free.limits.max_products),
                    pro: fmtLimit(tiers.pro.limits.max_products),
                    pro_max: fmtLimit(tiers.pro_max.limits.max_products),
                },
                {
                    label: 'Photos per product',
                    audience: 'all',
                    free: fmtLimit(tiers.free.limits.max_product_images),
                    pro: fmtLimit(tiers.pro.limits.max_product_images),
                    pro_max: fmtLimit(tiers.pro_max.limits.max_product_images),
                },
            ],
        },
        {
            heading: 'Analytics',
            rows: [
                {
                    label: 'Analytics history',
                    audience: 'all',
                    free: tiers.free.limits.analytics_history_days
                        ? `${tiers.free.limits.analytics_history_days} days`
                        : 'Unlimited',
                    pro: 'Unlimited',
                    pro_max: 'Unlimited',
                },
                { label: 'Time-period comparison', audience: 'all', free: false, pro: true, pro_max: true },
                { label: 'Product / customer drill-downs', audience: 'all', free: false, pro: true, pro_max: true },
                { label: 'Channel attribution', audience: 'all', free: false, pro: true, pro_max: true },
                { label: 'CSV export', audience: 'all', free: false, pro: false, pro_max: true },
                { label: 'Weekly email digest', audience: 'all', free: false, pro: false, pro_max: true },
                { label: 'RFM, cohort, forecast', audience: 'all', free: false, pro: false, pro_max: true },
                { label: 'Saved views and alerts', audience: 'all', free: false, pro: false, pro_max: true },
                { label: 'Cross-business analytics', audience: 'all', free: false, pro: false, pro_max: true },
                { label: 'Priority technical support', audience: 'all', free: false, pro: false, pro_max: true },
            ],
        },
        {
            heading: 'If you sell physical products',
            rows: [
                {
                    label: 'Storefront footer branding',
                    audience: 'physical',
                    free: 'Always shown',
                    pro: 'Removed',
                    pro_max: 'Removed',
                },
                { label: 'Stockout forecast and alerts', audience: 'physical', free: false, pro: false, pro_max: true },
            ],
        },
        {
            heading: 'If you sell digital products',
            rows: [
                {
                    label: 'Digital file storage',
                    audience: 'digital',
                    free: fmtBytes(tiers.free.limits.max_digital_storage_bytes),
                    pro: fmtBytes(tiers.pro.limits.max_digital_storage_bytes),
                    pro_max: fmtBytes(tiers.pro_max.limits.max_digital_storage_bytes),
                },
                {
                    label: 'Digital file size',
                    audience: 'digital',
                    free: fmtPerFile(tiers.free.limits.max_digital_file_bytes),
                    pro: fmtPerFile(tiers.pro.limits.max_digital_file_bytes),
                    pro_max: fmtPerFile(tiers.pro_max.limits.max_digital_file_bytes),
                },
                {
                    label: 'Marketplace fee per sale',
                    audience: 'digital',
                    free: `${tiers.free.marketplace_fee_percent}%`,
                    pro: `${tiers.pro.marketplace_fee_percent}%`,
                    pro_max: `${tiers.pro_max.marketplace_fee_percent}%`,
                },
            ],
        },
    ];
}

const FAQ: Array<{ q: string; a: string }> = [
    {
        q: 'Can I cancel any time?',
        a: 'Yes. Cancel from your billing page and you keep Pro features through the end of the billing period. After that you drop to Free — no charge, no fuss.',
    },
    {
        q: 'What happens to my products if I downgrade?',
        a: 'Nothing is deleted. If you have 12 products on Pro and downgrade to Free, you keep all 12 visible and editable. You just can\u2019t add a 13th until you upgrade again.',
    },
    {
        q: 'Is Pro Max worth it for a single store?',
        a: 'Pro Max is for serious operators who want forecasts, cohort analysis, and CSV exports. If you run one store and just want clean analytics, Pro is the sweet spot.',
    },
    {
        q: 'Which payment methods do you support?',
        a: 'Pay with mobile money, card, or bank transfer through Paystack. Junipay is also supported for direct integration. All amounts are in your local currency.',
    },
];

function formatPrice(amount: number, currency: string): string {
    if (amount === 0) return 'Free';
    return `${currency} ${amount.toLocaleString()}`;
}

interface TierBulletsProps {
    bullets: AudienceLine[];
    isPro: boolean;
}

/**
 * Renders a tier card's bullets in three blocks: universal lines first,
 * then a small heading + lines for physical-only, then the same for
 * digital-only. Both audience blocks render even when one might not apply
 * to a given visitor — they self-orient by reading the heading. This is
 * the public pricing page; the in-app modal already filters per active
 * business.
 */
function TierBullets({ bullets, isPro }: TierBulletsProps) {
    const universal = bullets.filter((b) => b.audience === 'all');
    const physical = bullets.filter((b) => b.audience === 'physical');
    const digital = bullets.filter((b) => b.audience === 'digital');

    const checkClass = `mt-0.5 h-4 w-4 shrink-0 ${isPro ? 'text-brand' : 'text-emerald-600'}`;

    return (
        <div className="mb-6 flex flex-1 flex-col gap-3">
            <ul className="flex flex-col gap-2.5">
                {universal.map((line) => (
                    <li
                        key={line.text}
                        className="flex items-start gap-2 text-sm text-site-fg"
                    >
                        <Check className={checkClass} strokeWidth={2.5} />
                        {line.text}
                    </li>
                ))}
            </ul>

            {physical.length > 0 && (
                <AudienceBlock
                    heading={AUDIENCE_HEADING.physical}
                    lines={physical}
                    checkClass={checkClass}
                />
            )}

            {digital.length > 0 && (
                <AudienceBlock
                    heading={AUDIENCE_HEADING.digital}
                    lines={digital}
                    checkClass={checkClass}
                />
            )}
        </div>
    );
}

function AudienceBlock({
    heading,
    lines,
    checkClass,
}: {
    heading: string;
    lines: AudienceLine[];
    checkClass: string;
}) {
    return (
        <div className="flex flex-col gap-2 border-t border-site-border/70 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-site-muted">
                {heading}
            </p>
            <ul className="flex flex-col gap-2">
                {lines.map((line) => (
                    <li
                        key={line.text}
                        className="flex items-start gap-2 text-sm text-site-fg"
                    >
                        <Check className={checkClass} strokeWidth={2.5} />
                        {line.text}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function PricingIndex({ currency, tiers }: Props) {
    const matrix = buildMatrix(tiers);

    return (
        <>
            <Head>
                <title>Pricing - biizz.app</title>
                <meta
                    name="description"
                    content="Plans that grow with your store. Start free, scale to Pro or Pro Max as you grow."
                />
            </Head>

            <div className="bg-site-bg">
                <LandingNav />

                {/* Hero */}
                <section className="px-4 pb-8 pt-16 text-center sm:pb-12 sm:pt-24">
                    <div className="mx-auto max-w-2xl">
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand">
                            Pricing
                        </p>
                        <h1 className="text-3xl font-bold leading-tight text-site-fg sm:text-4xl md:text-5xl">
                            Plans that grow with your store
                        </h1>
                        <p className="mt-4 text-base text-site-muted sm:text-lg">
                            Start free. Upgrade when you outgrow it. Cancel any time without
                            losing the data you&rsquo;ve built.
                        </p>
                    </div>
                </section>

                {/* Tier cards */}
                <section className="px-4 pb-16 sm:pb-24">
                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
                        {TIER_ORDER.map((key) => {
                            const tier = tiers[key];
                            const isPro = key === 'pro';
                            return (
                                <article
                                    key={key}
                                    className={`relative flex flex-col rounded-3xl border bg-white p-6 sm:p-8 ${
                                        isPro
                                            ? 'border-brand shadow-xl shadow-brand/10 md:scale-[1.02]'
                                            : 'border-site-border'
                                    }`}
                                >
                                    {isPro && (
                                        <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow">
                                            <Sparkles className="h-3 w-3" />
                                            Most popular
                                        </div>
                                    )}

                                    <header>
                                        <h2 className="text-xl font-bold text-site-fg">
                                            {tier.label}
                                        </h2>
                                        <p className="mt-1 text-sm text-site-muted">
                                            {tier.tagline}
                                        </p>
                                    </header>

                                    <div className="mt-6 mb-6">
                                        {tier.price === 0 ? (
                                            <p className="text-3xl font-bold text-site-fg">
                                                Free
                                            </p>
                                        ) : (
                                            <p className="text-site-fg">
                                                <span className="text-3xl font-bold">
                                                    {formatPrice(tier.price, currency)}
                                                </span>
                                                <span className="text-sm text-site-muted">
                                                    /month
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    <TierBullets
                                        bullets={TIER_HIGHLIGHTS[key]}
                                        isPro={isPro}
                                    />


                                    <PlanCTA tier={key} label={tier.label} isPro={isPro} />
                                </article>
                            );
                        })}
                    </div>
                </section>

                {/* Feature matrix */}
                <section className="px-4 pb-16 sm:pb-24">
                    <div className="mx-auto max-w-5xl">
                        <h2 className="mb-2 text-center text-2xl font-bold text-site-fg">
                            Compare every feature
                        </h2>
                        <p className="mb-8 text-center text-sm text-site-muted">
                            Every plan includes the operational features you need to run a
                            store. Higher tiers add insight and intelligence.
                        </p>

                        <div className="overflow-x-auto rounded-2xl border border-site-border bg-white">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-site-border bg-site-surface">
                                        <th className="py-3 pl-5 pr-3 text-xs font-bold uppercase tracking-widest text-site-muted">
                                            Feature
                                        </th>
                                        {TIER_ORDER.map((key) => (
                                            <th
                                                key={key}
                                                className={`px-3 py-3 text-center text-xs font-bold uppercase tracking-widest ${
                                                    key === 'pro'
                                                        ? 'text-brand'
                                                        : 'text-site-muted'
                                                }`}
                                            >
                                                {tiers[key].label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                {matrix.map((section) => (
                                    <tbody key={section.heading} className="border-b border-site-border last:border-0">
                                        <tr className="bg-site-surface/40">
                                            <th
                                                colSpan={1 + TIER_ORDER.length}
                                                scope="colgroup"
                                                className="py-2 pl-5 pr-3 text-left text-[11px] font-bold uppercase tracking-widest text-site-muted"
                                            >
                                                {section.heading}
                                            </th>
                                        </tr>
                                        {section.rows.map((row) => (
                                            <tr
                                                key={row.label}
                                                className="border-t border-site-border/70"
                                            >
                                                <td className="py-3 pl-5 pr-3 font-medium text-site-fg">
                                                    {row.label}
                                                </td>
                                                {(['free', 'pro', 'pro_max'] as const).map((key) => (
                                                    <td
                                                        key={key}
                                                        className="px-3 py-3 text-center"
                                                    >
                                                        {typeof row[key] === 'boolean' ? (
                                                            row[key] ? (
                                                                <Check className="mx-auto h-4 w-4 text-emerald-600" strokeWidth={3} />
                                                            ) : (
                                                                <span className="text-site-muted/60">—</span>
                                                            )
                                                        ) : (
                                                            <span className="text-sm font-semibold text-site-fg">
                                                                {row[key]}
                                                            </span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                ))}
                            </table>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="px-4 pb-16 sm:pb-24">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="mb-8 text-center text-2xl font-bold text-site-fg">
                            Common questions
                        </h2>
                        <dl className="space-y-4">
                            {FAQ.map((item) => (
                                <div
                                    key={item.q}
                                    className="rounded-2xl border border-site-border bg-white p-5"
                                >
                                    <dt className="text-base font-bold text-site-fg">
                                        {item.q}
                                    </dt>
                                    <dd className="mt-2 text-sm leading-relaxed text-site-muted">
                                        {item.a}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                <LandingFooter />
            </div>
        </>
    );
}
