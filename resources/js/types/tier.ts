// ─── Subscription Tier ───────────────────────────────────────────────────────
//
// Mirrors App\Enums\SubscriptionTier on the backend. Re-tiering is a
// config-only change in `config/biizz.php`; this type only changes when a
// brand-new tier is introduced. See ANALYTICS_TIERS.md section 1.1.

export type SubscriptionTier = 'free' | 'pro' | 'pro_max';

// Audience a feature applies to. `all` means both physical and digital
// businesses use it; the others narrow it to one business type. Used by
// the in-app upgrade modal and the public pricing matrix to hide rows
// that do not apply to the current viewer.
export type FeatureAudience = 'all' | 'physical' | 'digital';

export interface FeatureDefinition {
    min_tier: SubscriptionTier;
    audience: FeatureAudience;
}

// Feature key map shipped on every page in the Inertia `tier` shared prop.
// Each entry carries both the minimum tier required and the audience the
// feature applies to.
export type FeatureMap = Record<string, FeatureDefinition>;

// Per-tier numeric limits and boolean flags.
export type TierLimits = Record<string, number | null>;
export type TierFlags = Record<string, boolean>;

// Snapshot of one tier's metadata. Used both for the active tier and for
// every other tier (so upsell copy can reference the next tier's limits).
export interface TierMeta {
    rank: 0 | 1 | 2;
    label: string;
    price: number;
    tagline: string;
    marketplace_fee_percent: number;
    limits: TierLimits;
    flags: TierFlags;
}

// Subscription lifecycle status for the active business. Mirrors the
// constants on App\Models\Business. `inactive` covers Free users who have
// never paid; `cancel_at_period_end` keeps them on their tier until the
// renewal date.
export type SubscriptionStatus =
    | 'inactive'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'cancel_at_period_end';

// Inertia shared prop. `null` means the route did not resolve a business
// (e.g. login page) and tier checks should not be invoked.
export interface TierShared {
    current: SubscriptionTier;
    rank: 0 | 1 | 2;
    label: string;
    features: FeatureMap;
    limits: TierLimits;
    flags: TierFlags;
    tiers: Record<SubscriptionTier, TierMeta>;
    currency: string;
    trial_ends_at: string | null;
    subscription_status: SubscriptionStatus;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    // True only when Paystack drives renewal (card subscription with an
    // active status). False for manual momo/bank lane and for past_due. UI
    // uses this to pick "Renews on" vs "Expires on" copy and to gate the
    // cancel section.
    auto_renew: boolean;
}

// Live digital file storage snapshot for the active business. `null` on
// routes without a resolved business. `quota_bytes` / `per_file_max_bytes`
// are `null` when the active tier has no cap. Drives the pre-upload check
// in digital product file pickers.
export interface DigitalStorageShared {
    used_bytes: number;
    quota_bytes: number | null;
    per_file_max_bytes: number | null;
}
