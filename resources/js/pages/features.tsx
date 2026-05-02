import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Bot,
    CreditCard,
    Globe,
    Lock,
    Palette,
    ShoppingBag,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import LandingFooter from '@/components/Landing/LandingFooter';
import LandingNav from '@/components/Landing/LandingNav';

/**
 * /features — the deep-dive marketing page. Home page only teases; this
 * page exists for visitors who clicked through deliberately and want the
 * full picture before deciding to sign up. Linked from LandingNav and the
 * /pricing page.
 *
 * Mirrors the structure of ANALYTICS_TIERS.md so docs and marketing copy
 * stay in sync as analytics builds out.
 */

type FeatureSection = {
    eyebrow: string;
    title: string;
    blurb: string;
    bullets: { icon: typeof ShoppingBag; title: string; detail: string }[];
};

const SECTIONS: FeatureSection[] = [
    {
        eyebrow: 'Storefront',
        title: 'A store that looks like yours, runs like ours',
        blurb:
            'Pick from designer-built themes, set your brand tokens, and you\u2019re live in minutes. Mobile-first, SEO-clean, and built to load fast on slow networks.',
        bullets: [
            {
                icon: Palette,
                title: 'Designer themes',
                detail:
                    'Boutique, Classic, Course Funnel — three production-grade themes covering physical retail and digital products. More on the way, or use ours as a starting template.',
            },
            {
                icon: Globe,
                title: 'Custom domain (Pro)',
                detail:
                    'Bring your own domain or use the free *.biizz.app subdomain. Pro plans hide our branding so the storefront feels 100% yours.',
            },
            {
                icon: ShoppingBag,
                title: 'Pages & policies',
                detail:
                    'Build About, FAQ, Shipping, and Acceptable-Use pages right inside your dashboard. No separate CMS, no copy-paste from Notion.',
            },
        ],
    },
    {
        eyebrow: 'Payments',
        title: 'Get paid directly. We never touch the money.',
        blurb:
            'Connect your payment provider and every shilling goes straight into your account. We\u2019re a tool, not a middleman.',
        bullets: [
            {
                icon: CreditCard,
                title: 'Paystack & Junipay',
                detail:
                    'Mobile money, card, and bank transfer through Paystack — the gold standard in Ghana. Junipay is supported as a direct alternative.',
            },
            {
                icon: Lock,
                title: 'Cash on delivery',
                detail:
                    'For physical stores that prefer it: take orders online, collect payment when the parcel arrives. Configurable per business.',
            },
            {
                icon: TrendingUp,
                title: 'Order tracking',
                detail:
                    'Every order, every refund, every dispute lives in one searchable timeline. Filter by status, date, channel, customer.',
            },
        ],
    },
    {
        eyebrow: 'Marketplace',
        title: 'A shopfront and a marketplace, in one',
        blurb:
            'Digital sellers can list courses, ebooks, templates, and coaching on the public biizz marketplace too — automatic delivery, automatic receipts, low fees that drop with every plan tier.',
        bullets: [
            {
                icon: ShoppingBag,
                title: 'Instant digital delivery',
                detail:
                    'Files, external links, and reader-mode delivery for ebooks. Buyers get access seconds after payment, you get a notification.',
            },
            {
                icon: TrendingUp,
                title: 'Tier-based platform fees',
                detail:
                    'Free 5%, Pro 3%, Pro Max 1% on every digital sale. Lower fees pay for the subscription very quickly if you\u2019re moving real volume.',
            },
            {
                icon: Bot,
                title: 'Built-in checkout',
                detail:
                    'No need to wire anything to Gumroad or Stripe. Buyers check out in three taps; you don\u2019t maintain a parallel storefront.',
            },
        ],
    },
    {
        eyebrow: 'Analytics',
        title: 'Numbers that actually answer questions',
        blurb:
            'Free starts you with the operational basics. Pro adds insight: which products, which customers, which channels. Pro Max adds intelligence: forecasts, exports, and goal tracking.',
        bullets: [
            {
                icon: BarChart3,
                title: 'Free overview',
                detail:
                    'Revenue, orders, conversion. Last 30 days, four KPI tiles, one line chart. The minimum every operator needs.',
            },
            {
                icon: TrendingUp,
                title: 'Pro insight',
                detail:
                    'Period comparison, per-product drill-downs, channel mix (storefront vs WhatsApp vs Marketplace), repeat-customer rate, AOV.',
            },
            {
                icon: Sparkles,
                title: 'Pro Max intelligence',
                detail:
                    'CSV export, weekly email digest, RFM segmentation, cohort retention, stockout forecast, threshold alerts, multi-business analytics.',
            },
        ],
    },
];

export default function FeaturesPage() {
    return (
        <>
            <Head>
                <title>Features - biizz.app</title>
                <meta
                    name="description"
                    content="Designer themes, direct payments, marketplace, and analytics that answer real questions. Everything biizz can do, in one place."
                />
            </Head>

            <div className="bg-site-bg">
                <LandingNav />

                {/* Hero */}
                <section className="px-4 pb-12 pt-20 text-center sm:pb-20 sm:pt-28">
                    <div className="mx-auto max-w-3xl">
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand">
                            Features
                        </p>
                        <h1 className="text-3xl font-bold leading-tight text-site-fg sm:text-5xl">
                            Everything you need to sell online
                        </h1>
                        <p className="mt-5 text-base leading-relaxed text-site-muted sm:text-lg">
                            One platform: storefront, payments, marketplace, analytics.
                            Built for African operators who want power without the
                            complexity of stitching five tools together.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-hover"
                            >
                                Start for free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center gap-2 rounded-full border border-site-border bg-white px-6 py-3 text-sm font-semibold text-site-fg transition hover:bg-site-surface"
                            >
                                See pricing
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Deep-dive sections */}
                {SECTIONS.map((section, idx) => (
                    <section
                        key={section.eyebrow}
                        className={`px-4 py-16 sm:py-20 ${
                            idx % 2 === 1 ? 'bg-site-surface' : ''
                        }`}
                    >
                        <div className="mx-auto max-w-5xl">
                            <div className="mb-10 max-w-2xl">
                                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">
                                    {section.eyebrow}
                                </p>
                                <h2 className="text-2xl font-bold leading-tight text-site-fg sm:text-3xl">
                                    {section.title}
                                </h2>
                                <p className="mt-3 text-base leading-relaxed text-site-muted">
                                    {section.blurb}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                {section.bullets.map((b) => (
                                    <div
                                        key={b.title}
                                        className="rounded-2xl border border-site-border bg-white p-6"
                                    >
                                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                            <b.icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="mb-1.5 text-base font-bold text-site-fg">
                                            {b.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-site-muted">
                                            {b.detail}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                ))}

                {/* Final CTA */}
                <section className="px-4 py-20 sm:py-28">
                    <div className="mx-auto max-w-3xl rounded-3xl bg-linear-to-br from-brand to-brand/80 px-8 py-12 text-center text-white shadow-xl shadow-brand/10 sm:px-12 sm:py-16">
                        <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                            Ready when you are
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                            Free forever for your first store. Upgrade when you outgrow it.
                            Cancel any time without losing the data you&rsquo;ve built.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-brand transition hover:bg-white/90"
                            >
                                Start for free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Compare plans
                            </Link>
                        </div>
                    </div>
                </section>

                <LandingFooter />
            </div>
        </>
    );
}
