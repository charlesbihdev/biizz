# biizz.app - Tier System and Analytics Tiers

> Source-of-truth for the subscription tier architecture and what Free, Pro,
> and Pro Max users get. Read top-to-bottom before touching any tier-gated
> code. The architectural rules in section 1 apply to every gated feature in
> the app, not only Analytics.
>
> Cross-references:
> - `ROADMAP.md` (Phase C: Marketing Intelligence, Phase D: AI Agent)
> - `BIIZZ_APP_ARCHITECTURE.md` (Pillars III + IV)
> - `Theme.md` (storefront data sources)
> - `ANALYTICS_FUTURE.md` (features blocked on Pixel / AI / verification - to be created)

---

## 1. Architectural rules (apply to every gated feature)

These are not analytics-specific. They are the contract that any tier-aware
code in the codebase must follow.

### 1.1 Config-driven gating

Every tier-restricted feature has a stable **feature key** (for example
`analytics.compare_periods`, `products.unlimited`, `storefront.no_branding`).
The mapping from feature key to required tier lives in `config/biizz.php`,
section `features`. Code references the key, never the tier name directly.

Why: re-tiering becomes a one-line config edit. Move RFM from Pro Max to
Pro? Edit one line. Add a new gated feature? Add one line. No code rewrite,
no migrations.

Hard rules:
- **Never hardcode a tier name** like `'pro'` or `'pro_max'` in code.
  Always go through `FeatureAccess::check($business, 'feature.key')`.
- **Never hardcode numeric limits** in controllers/services. Always read
  via `FeatureAccess::limit($business, 'limit_key')`.
- **Never hardcode boolean flags** in components/middleware. Always read
  via `FeatureAccess::flag($business, 'flag_key')`.
- An unknown feature key must throw, not silently allow or deny. Loud
  failures > silent ones.

### 1.2 Visible-but-grayed pattern

Lower-tier users **always see** the toggle, button, chart shell, or input
that a higher tier would unlock. They never see a missing UI. They see the
control rendered in a disabled state with a small Pro/Pro Max pill, and a
click triggers the upgrade modal (modal flow lands in Phase 4; for now it
is a no-op CTA).

Hard rules:
- Hidden features sell nothing. **Never** hide a Pro/Pro Max control from
  Free users.
- The disabled UI must show what the unlocked state would look like
  (sample/blurred data, ghost preview, disabled toggle in the "off-but-
  hover-to-explain" state).
- The same control on Pro/Pro Max renders fully interactive. Same
  component, same DOM position, different state.

Concrete example (the storefront branding toggle):

| Tier | UI | Backend |
|---|---|---|
| Free | `show_branding` toggle visible, locked ON, disabled, "Pro" pill, hover tooltip "Hide biizz branding on Pro" | Form request **forces** `show_branding = true` regardless of submitted value |
| Pro / Pro Max | Same toggle, fully interactive | Form request accepts the submitted value |

### 1.3 Frontend and backend symmetry

Every restriction exists in **both** layers, never only one.

- **Frontend:** UX layer. Controls disabled, blurred, accompanied by tier
  pills and upgrade CTAs. Reads `FeatureAccess` via the Inertia `tier`
  shared prop and the `useTier()` hook.
- **Backend:** security layer. `FormRequest::prepareForValidation()`
  rewrites blocked fields. Controllers/services call
  `FeatureAccess::check()` and abort 402 (Payment Required) on violation.
  Never trust the frontend to enforce tier rules.

Why: a determined Free user can bypass any frontend lock with curl. The
backend is the source of truth for what gets persisted; the frontend is
the source of truth for what is shown. Both must agree.

### 1.4 Data preservation on downgrade

Cancelling a tier never destroys data. Existing records that exceed the
new tier's limits stay visible and editable. Only **new** actions get
blocked.

Hard rules:
- A Free user with 12 products from a previous Pro subscription keeps
  all 12 visible and editable. They cannot add a 13th.
- A Free user with 8 product images keeps all 8 visible. They cannot
  add a 9th. They cannot remove and re-add to circumvent.
- Same logic for saved views, alerts, exports history, etc.

This is the trust contract that makes Pro re-conversion possible.

### 1.5 No 404s, no empty states, no surprises

Locked features render their chart shell or control with sample/blurred
data. Never `abort(404)`. Never an empty state with nothing to do.

### 1.6 Friction at peak intent

The paywall fires the moment the user clicks the gated control (Compare,
Export, Save view, etc.), not on dashboard load. Same model as Stripe,
Linear, Notion, Figma.

### 1.7 Personalised teasers beat generic ones

Every locked state must use the user's own data ("Your top product was
Bag X. See its 30-day curve - Pro"), not stock copy. This is the single
biggest conversion lever.

---

## 2. Three layers of value

| Layer | Question it answers | Tier |
|---|---|---|
| Operational | "What happened?" | Free |
| Insight | "What does it mean?" | Pro |
| Intelligence | "What should I do next?" | Pro Max |

---

## 3. Free tier - operational

What Free users keep forever:

- All existing stat tiles on Products, Orders, Payments, Customers
  (Total / Active / Paid / Pending / Failed / Revenue, etc).
- Per-row operational data on those resource pages.
- One Analytics Overview page with a fixed last-30-days range:
  - Revenue card
  - Orders count card
  - Top 5 products by units
  - Last 10 orders feed

Locked on Free (visible but disabled):

- Date range picker (locked to "last 30 days")
- Period comparison
- Drill-downs (per-product, per-customer, per-category)
- Channel attribution
- Exports / email reports

Free tier limits (Phase 2 will enforce these via `FeatureAccess`):

| Limit | Free |
|---|---|
| `max_products` | 3 |
| `max_product_images` | 1 |
| `analytics_history_days` | 30 |
| `storefront_branding` (forced ON) | true |

Why this works: Free users still see Analytics exists and is valuable. The
single overview page is the upsell engine - do not skip it.

---

## 4. Pro tier - insight

Same data Free users see, but sliced by **time**, **dimension**, and
**comparison**. None of these features need Meta Pixel, AI, or WhatsApp.

### 4.1 Revenue and sales

| Feature key | Source | Notes |
|---|---|---|
| `analytics.revenue_chart` | `orders.total`, `orders.paid_at` | Day / week / month / year / custom range |
| `analytics.compare_periods` | Shifted window over same query | "Up 18% vs last month" copy |
| `analytics.aov` | `sum/count` orders | Single-number KPI |
| `analytics.refund_rate` | `orders.status in (cancelled, refunded)` | Health signal |
| `analytics.heatmap` | `groupBy(hour, dow)` on `paid_at` | When to post / staff |

### 4.2 Products

| Feature key | Source | Notes |
|---|---|---|
| `analytics.top_products` | `order_items` join `products` | Sorted, paginated |
| `analytics.top_categories` | `order_items -> products.category_id` | Pairs with merchandising |
| `analytics.stock_velocity` | `units_sold / window` | "X days of cover left" |
| `analytics.product_drilldown` | filtered top-products view | Powers `?product={slug}` deep link |

### 4.3 Customers

| Feature key | Source | Notes |
|---|---|---|
| `analytics.repeat_rate` | customers with >= 2 orders | Extends existing `repeat_buyers` count |
| `analytics.new_vs_returning` | first-order date vs window | Acquire-vs-retain decision |
| `analytics.top_customers` | `sum(orders.total) by customer_id` | LTV leaderboard |
| `analytics.customer_drilldown` | filtered customer view | Powers `?customer={id}` deep link |

### 4.4 Channel attribution

| Feature key | Source | Notes |
|---|---|---|
| `analytics.channel_mix` | `orders.source` (already tracked) | Storefront vs WhatsApp vs Instagram |
| `analytics.gateway_health` | `payments.status` per gateway | Paystack vs Junipay |

### 4.5 Pro tier limits (above Free)

| Limit | Pro |
|---|---|
| `max_products` | unlimited |
| `max_product_images` | 8 |
| `analytics_history_days` | unlimited |
| `storefront_branding` flag | not forced |

### 4.6 Deep-link query contract

Resource pages link into Analytics with these params, no chart logic on
resource pages:

| Param | Effect |
|---|---|
| `?product={slug}` | Filter to product |
| `?customer={id}` | Filter to customer |
| `?category={id}` | Filter to category |
| `?range=last_30d\|last_90d\|ytd\|custom&from=...&to=...` | Time window |
| `?compare=previous\|yoy\|none` | Comparison mode |

---

## 5. Pro Max tier - intelligence

Same data, more leverage. The "premium" feeling comes from time-series math,
outputs, and convenience - not magic.

| Feature key | Source | Notes |
|---|---|---|
| `analytics.export_csv` | Same queries | Accountants / managers need this |
| `analytics.email_digest` | Cron + Mailable | "Sent every Monday" - clean tagline, no AI/WhatsApp dependency |
| `analytics.custom_compare` | Two windowed queries | Pro = previous period only; Pro Max = any range vs any range |
| `analytics.saved_views` | jsonb column on user | Stickiness feature |
| `analytics.rfm` | Recency / Frequency / Monetary buckets | Looks sophisticated, just bucketing |
| `analytics.cohort_retention` | `customers.created_at` x order months | The "serious analytics" chart |
| `analytics.stockout_forecast` | `velocity * current_stock` | No ML. Pure math. Feels predictive |
| `analytics.goals` | one table, chart annotation | "Set a monthly revenue goal, see progress" |
| `analytics.multi_business` | Loop over user's businesses | Power-user feature, gates well |
| `analytics.threshold_alerts` | Cron + thresholds | "Alert me if refund rate > 5%" |

Pro Max tier limits (above Pro):

| Limit | Pro Max |
|---|---|
| `max_product_images` | 20 |

---

## 6. Phased build plan

The complete tier stack across phases:

```
Phase 0 - Foundation         (subscription_tier column + config + gate primitives)
Phase 1 - Plan model + page  (static /pricing page, plan presentation)
Phase 2 - Restrictions       (3 products, 1 image, biizz tag, analytics locks)
Phase 3 - Billing            (Paystack subscriptions, webhooks, tier switching)
Phase 4 - Conversion machine (modals, value-you-missed counter, 90-day nudges)
```

Phase 0 is the only phase that lays foundation; every later phase is purely
additive.

---

## 7. Phase 0 - foundation (the contract)

### 7.1 Database

| Column | On table | Notes |
|---|---|---|
| `subscription_tier` | `businesses` | enum `free` \| `pro` \| `pro_max`, default `free`, indexed |
| `subscription_expires_at` | `businesses` | timestamp nullable |
| `trial_ends_at` | `businesses` | timestamp nullable |
| `subscription_changes` | new audit table | `business_id`, `from_tier`, `to_tier`, `changed_by`, `reason`, `created_at` |

### 7.2 Backend

- `App\Enums\SubscriptionTier` (string-backed enum: `free`, `pro`, `pro_max`)
  with `rank()`, `canAccess()`, `label()`.
- `config/biizz.php` with two top-level sections:
  - `tiers` -> per-tier `limits` (numeric) and `flags` (boolean).
  - `features` -> feature key to required tier mapping (the re-tiering knob).
- `App\Services\Subscription\FeatureAccess` (singleton, only place that
  reads `config('biizz.*')`):
  - `tierFor(string $featureKey): SubscriptionTier`
  - `check(Business $business, string $featureKey): bool`
  - `limit(Business $business, string $limitKey): ?int`
  - `flag(Business $business, string $flagKey): bool`
- `App\Http\Middleware\EnsureFeatureAccess` aliased as `'feature'`. Usage:
  `Route::middleware(['feature:analytics.compare_periods'])`. Aborts 402 on
  violation.
- `Business::setTier(SubscriptionTier $tier, ?User $by, ?string $reason)`
  helper that writes to `businesses.subscription_tier` and inserts a
  `subscription_changes` audit row in one transaction.

### 7.3 Inertia bridge

`HandleInertiaRequests::share()` adds one prop:

```php
'tier' => fn () => $business ? [
    'current'    => $business->subscription_tier->value,
    'rank'       => $business->subscription_tier->rank(),
    'features'   => config('biizz.features'),
    'limits'     => $business->subscription_tier->limits(),
    'flags'      => $business->subscription_tier->flags(),
    'expires_at' => $business->subscription_expires_at?->toIso8601String(),
] : null,
```

### 7.4 Frontend primitives

- `resources/js/types/tier.ts` - `SubscriptionTier` literal type and
  `TierShared` shape.
- `resources/js/hooks/useTier.ts` - reads Inertia shared `tier`, exposes
  `current`, `can(featureKey)`, `limit(key)`, `flag(key)`.
- `resources/js/components/common/TierLock.tsx` - one component, gates by
  feature key:

  ```tsx
  <TierLock feature="analytics.compare_periods">
      <CompareChart />
  </TierLock>
  ```

  Phase 0 behaviour: if `useTier().can(feature)` -> render children. Else
  render blurred children + small "Pro - Coming soon" CTA strip. Modal flow
  lands in Phase 4; the call sites do not change.

### 7.5 Verification

- `FeatureAccess::check` unit test (free, pro, pro_max).
- `EnsureFeatureAccess` middleware feature test (402 for free, 200 for pro+).
- `TierSharedPropsTest` asserts shape of the Inertia `tier` shared prop.

---

## 8. Phase 2 - restrictions (preview)

Each restriction is a single-line lookup. None require new architecture
because Phase 0 set up the primitives.

| Restriction | Feature key | Backend enforcement | Frontend UX |
|---|---|---|---|
| Max 3 products on Free | `products.unlimited` (flag) and `max_products` (limit) | `StoreProductRequest::authorize()` checks `FeatureAccess::limit($b, 'max_products')` against current count | "Add product" button disabled with Pro pill + upgrade CTA inline card |
| Max 1 image on Free | `products.multiple_images` (flag) and `max_product_images` (limit) | `StoreProductRequest::rules()` validates `images` array `max` against `FeatureAccess::limit($b, 'max_product_images')` | Image picker shows N-1 disabled slots with Pro pill |
| Compulsory biizz branding on Free | `storefront.no_branding` (flag) | `UpdateBusinessSettingsRequest::prepareForValidation()` forces `show_branding = true` if `! FeatureAccess::check($b, 'storefront.no_branding')` | Toggle visible, locked ON, disabled, Pro pill (visible-but-grayed pattern) |
| Analytics drill-downs | `analytics.product_drilldown`, `analytics.customer_drilldown` | `EnsureFeatureAccess` middleware on the route | `<TierLock feature="analytics.product_drilldown">` wrapper |
| Analytics intelligence (RFM, cohort, forecast) | `analytics.rfm`, `analytics.cohort_retention`, `analytics.stockout_forecast` | `EnsureFeatureAccess` middleware on the route | `<TierLock feature="...">` wrapper |
| Analytics exports/digest/alerts | `analytics.export_csv`, `analytics.email_digest`, `analytics.threshold_alerts` | `EnsureFeatureAccess` middleware on the route | Disabled buttons with Pro Max pill |

The data preservation rule from 1.4 applies to every restriction. Existing
data stays. New actions get blocked.

---

## 9. Phase 4 - conversion machine (preview)

Section 9 captures the upgrade-craving layer. None of it requires new gates,
only new UX layered on top of `<TierLock>`. Highlights:

- The four upgrade-trigger modals: "see further back", "compare", "drill in",
  "get it out of the dashboard".
- The personalised "value-you-missed" counter on the Free Analytics overview.
- The 30-day cliff (the visual edge of Free's data window).
- The 90-day Free user nudge cadence (Day 0, 7, 14, 30, 45, 60, 75, 90).
- The "you almost upgraded" loop for users who clicked an upgrade CTA but
  did not convert.
- Tier badges as ambient pressure (tiny "Pro"/"Pro Max" pills next to every
  gated control).
- Behaviour-segmented Free users (light vs heavy, two pitches, two empty-
  state strategies).
- 7-day Pro trial mechanics (no card, scarce, day-5 nudge, no Pro Max trial
  at launch).

Everything in Phase 4 reads from the same `<TierLock>` and `FeatureAccess`
primitives Phase 0 put in place.

---

## 10. Pricing page mechanics

The `/pricing` page is the closer. It must do four things:

1. **Three columns side by side**: Free, Pro, Pro Max. Pro is the visually
   highlighted middle (anchor effect).
2. **Outcome row, not feature row, at the top**:
   - Free: "Run your store."
   - Pro: "Grow your store."
   - Pro Max: "Scale across stores."
3. **Feature comparison matrix** below outcomes (mirrors sections 3-5).
4. **Single FAQ block** addressing: "Can I cancel?" "Do I lose data?"
   "Is Pro Max worth it?" "Local payment methods?" Use mobile money + card
   framing for African markets ("Pay with MoMo, card, or bank").

Anchoring rule: Pro Max price ~= 2x Pro. This makes Pro look moderate.
Don't price Pro Max at 1.3x or 4x; both kill the anchor.

---

## 11. Copy bank

Tier names in product UI: **Free**, **Pro**, **Pro Max**.

Always shape locked-state copy as:

> "{user's own number or fact} - {what Pro reveals}. {one-click CTA}."

### 11.1 Good (specific, personal, loss-framed)

- "Your revenue grew 14% last month - see the daily curve on Pro."
- "Bag X sold 38 units in 7 days. See its 90-day trend on Pro."
- "You have 12 repeat customers. Pro Max shows who they are and what they
  buy next."
- "Last Monday's report would have shown your top 10 customers. Get it
  every Monday on Pro Max."
- "Don't lose this. Your 30-day cohort window resets Sunday. Save it on
  Pro Max."
- "Junipay processed 18% slower than Paystack last week. Pro shows you why."

### 11.2 Bad (generic, abstract, feature-list)

- "Upgrade to unlock this feature."
- "Get more analytics with Pro."
- "Advanced reporting available on Pro Max."
- "View detailed insights."

The pattern: **specific data + specific outcome + specific tier**. If any
of the three is missing, the copy will not convert.

---

## 12. Anti-patterns (do not do these)

- **Do not hardcode tier names** in code paths. Always go through
  `FeatureAccess`.
- **Do not hide features from Free.** Hidden features sell nothing. Always
  render with lock UX.
- **Do not break the working flow.** Free users still need to run their
  store. The paywall is on insight, never on operation. Order CRUD,
  product CRUD, payments, and existing tiles stay free forever.
- **Do not hard-paywall on dashboard load.** Friction at peak intent only -
  on the click, not on the visit.
- **Do not nudge more than once per session in-app.** Email cadence is
  separate.
- **Do not lie in teasers.** If the personalised number is "GHS 0", show
  the empty state instead of fabricating a benchmark. Trust is the long-
  tail conversion lever.
- **Do not delete or hide existing data on downgrade.** Block new actions,
  never destroy what the user already has.
- **Do not gate the "value-you-missed" counter behind anything.** It is
  the conversion engine; it must be free, fast, and accurate.

---

## 13. What is intentionally excluded from launch

These belong in `ANALYTICS_FUTURE.md` and ship after their dependency is met:

- Anything Meta Pixel driven (funnel, attribution, retargeting audiences)
  -> blocked on FB verification
- AI-generated weekly digest -> blocked on AI agent (Pillar III)
- WhatsApp-delivered reports -> blocked on AI agent + WhatsApp Cloud API
- Anomaly detection / smart alerts -> deferred until volume justifies it
- API access for analytics -> deferred until v2

The Pro / Pro Max tiers above are deliberately self-contained and shippable
**before** any of the above lands. When those land, they slot into Pro Max
without restructuring the tier model.

---

*Last updated: 2026-05-01.*
