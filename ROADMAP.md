# BIIZZ.APP ROADMAP

> Cold-start handoff doc. Read top-to-bottom before touching code.
> Source-of-truth specs: `BIIZZ_APP_ARCHITECTURE.md`, `Theme.md`, `CLAUDE.md`, `AGENTS.md`.

---

## 1. WHAT WE'RE BUILDING

E-commerce OS for Africa / emerging markets. One user, many businesses. Each business gets:

- Storefront (theme-driven, structurally unique per industry)
- Encrypted payments (Paystack + Junipay)
- WhatsApp AI sales agent (opt-in)
- Meta Pixel auto-tracking
- Self-aware admin dashboard (renders fields from active theme schema)

Plus a **Marketplace** layer for digital products (courses, ebooks, downloads). Buyers buy from creators across the platform. This is parallel to the per-business storefront flow.

Domain: `biizz.app`. Subdomain routing planned: `{slug}.biizz.app`.

---

## 2. STACK (locked, do not swap without approval)

- PHP 8.4, Laravel 13
- Inertia v2 + React 19 + TypeScript strict
- Tailwind v4
- Zustand (cart store, persisted)
- Pest 4 (feature tests dominate)
- Spatie Laravel Data (DTOs for jsonb writes)
- Fortify (auth) + Socialite (Google OAuth)
- Wayfinder (typed routes from Laravel to TS)
- Laravel Boost MCP (use `search-docs` before guessing API)
- DB: SQLite dev, Postgres 16+ prod (jsonb + GIN)

---

## 3. CORE PATTERNS (memorize these)

### 3.1 Tenancy
- `ResolveBusiness` middleware turns URL into `BusinessContext::current()`
- `BusinessScope` global scope auto-appends `WHERE business_id = ?` on every business-owned model
- No business resolved = `403`. Never fall back to a default.
- Every new business-owned model MUST attach `BusinessScope` in `booted()`

### 3.2 Themes (read `Theme.md` in full before theme work)
- Themes own ALL UI. Shared owns ALL logic.
- Three themes scaffolded: `Classic` (active), `Boutique` (inactive), `CourseFunnel` (active, digital-product flow)
- Add a theme: create folder + `index.ts` + `schema.ts`, add ONE entry to `resources/js/Themes/registry.ts`. Nothing else changes.
- Storefront pages (`resources/js/pages/Storefront/*.tsx`) are thin resolvers. They look up `THEME_MAP[business.theme_id][PageName]` via the lazy Proxy. No conditionals, no UI.
- Theme components must not contain business logic. Pull from `Themes/Shared/Hooks/`.
- Admin settings form auto-generates from `SCHEMA_MAP[themeId]`. Do not hardcode fields.
- `productFields` per theme (see CourseFunnel) extends product form with theme-specific inputs (e.g. promo_video).

### 3.3 Payments
- Provider keys are AES-256 encrypted at rest (Laravel `Encrypter`)
- `PaymentGatewayFactory` resolves Paystack vs Junipay. Always go through it.
- Decrypt happens inside service only. Key never returned to frontend, never logged, never cached.
- Owner role check before any decrypt. Fail loud, not silent.
- Webhooks land in `routes/webhooks.php`. Verification via `PaymentVerificationService`.

### 3.4 Frontend rules
- No `.tsx` over 200 lines unless genuinely atomic. Split into components.
- Hooks > inline logic. Group hooks by domain in subfolders if they grow.
- Components folder: `common/` for shared, `<feature>/` for feature-specific (e.g. `admin/orders/`, `storefront/cart/`).
- Frontend calls Laravel ONLY through Wayfinder (`@/actions`, `@/routes`). No hardcoded URLs.
- Inertia v2: use `<Form>`, `useForm`, deferred props with skeleton fallbacks, prefetching on `<Link>` where it helps.

### 3.5 Backend rules
- Controllers thin. Services thick. DTOs validate jsonb.
- Eloquent only. No `DB::`. No raw SQL unless complex aggregate.
- Eager-load with `->with()`. N+1 = bug.
- Form Requests for validation. No inline `$request->validate()`.
- `php artisan make:*` for everything. Match sibling file conventions.
- Run `vendor/bin/pint --dirty --format agent` after PHP edits.
- Every change ships with a Pest test. Run `php artisan test --compact --filter=Name`.

### 3.6 Style hard rules
- NO em-dashes anywhere (code, comments, copy, docs). Use hyphens, colons, parentheses, or two sentences.
- UI must look professional, not AI-generated. No purple gradients, no random emoji, no generic landing-page tropes.
- Use descriptive identifiers: `isRegisteredForDiscounts`, not `discount()`.
- Comment only when WHY is non-obvious. Don't narrate WHAT.

---

## 4. CURRENT STATE (verified 2026-04-27)

### Built
- Migrations: users, businesses, business_users, categories, products, product_images, product_files, customers, customer_addresses, orders, order_items, payments, pages, buyers, marketplace_purchases, marketplace_payments
- Models: full set above + `Scopes/BusinessScope`
- Middleware: `ResolveBusiness`, `HandleInertiaRequests`, `HandleAppearance`
- Services: `BusinessContext`, `PaymentService`, `PaymentVerificationService`, `Payments/{PaymentGateway, PaystackGateway, JunipayGateway, PaymentGatewayFactory, InitializeResult, VerificationResult}`
- DTOs: `Data/ThemeSettingsData`
- Controllers
  - Storefront side: `StorefrontController`, `CheckoutController`, `CustomerAccountController`, `StorefrontAuth/*`
  - Marketplace side: `MarketplaceController`, `CreatorCatalogController`, `MarketplaceAccountController`, `MarketplaceLibraryController`, `MarketplacePurchaseController`, `MarketplaceAuth/*`
  - Admin: `Admin/{Business, Category, Customer, Media, Order, Page, Payment, Product, ThemeSettings}Controller`
- Routes split across: `web, auth, admin, settings, storefront, marketplace, customer, customer_auth, console, webhooks`
- Auth: Fortify + Socialite Google done
- Themes registry: lazy Proxy with prefetch cache, `productFields` extension hook
- Themes scaffolded: Classic (Layout, ThemeShell, Components, Pages), Boutique (basic, inactive), CourseFunnel (Pages + Components, active)
- Storefront pages: Main, Shop, Product, Checkout, CheckoutSuccess, Contact, Page, Account, CreatorCatalog
- Admin pages: Businesses, Categories, Customers, Orders, Pages, Payment, Products, Theme
- Tests: feature scaffolding under `tests/Feature/{Admin, Auth, Settings, Storefront}`

### Not yet built (the work ahead)
- AI Commerce Agent (Pillar III): no `AIAgentService`, no WhatsApp webhook controller, no agent admin UI
- Meta Pixel pipeline (Pillar IV): `useMetaPixel` hook + auto-fire on ViewContent / AddToCart / InitiateCheckout / Purchase
- Live Preview iframe in admin Theme settings page
- Subdomain routing in production (`{slug}.biizz.app`); current routing likely path-based
- Boutique theme: incomplete, marked `active: false`. Needs Pages + full Components before flipping
- Empty/blank: `payment_implementation_plan.md` (was a placeholder, now superseded by this file)

---

## 5. NEXT-PHASE PRIORITIES

Order matters. Do not jump ahead.

### Phase A: Close the storefront loop (highest leverage)
1. End-to-end Paystack test order on Classic theme: cart -> checkout -> webhook -> order paid -> confirmation page. Pest feature test covers it.
2. Same for CourseFunnel (digital delivery: paid order grants access to `ProductFile`).
3. Admin Orders page: list, filter by status, view detail, manual mark-fulfilled.
4. Admin Theme settings: confirm schema-driven form renders for all three themes. Add Live Preview iframe.

### Phase B: Marketplace MVP
1. Buyer auth (already scaffolded, verify flow).
2. CreatorCatalog browsing across all businesses with `course-funnel` theme or `is_marketplace_listed` flag.
3. Buyer purchase flow -> `MarketplacePurchase` + `MarketplacePayment` -> grant library access.
4. Buyer Library page (already scaffolded controller).

### Phase C: Marketing Intelligence (Pillar IV)
1. `useMetaPixel(pixelId)` hook in `Themes/Shared/Hooks/`.
2. Auto-fire events from cart store + checkout flow + product page mount.
3. Admin: paste-Pixel-ID input on business settings.
4. Test: hook fires nothing when `pixelId` empty.

### Phase D: AI Commerce Agent (Pillar III)
1. WhatsApp Cloud API wiring (webhook controller in `routes/webhooks.php`).
2. `AIAgentService`: `searchProducts`, `checkInventory`, `getBusinessInfo`, `buildOrderSummary`, `generatePaymentLink`, `sendConfirmation`.
3. Single-use payment link page (minimal, 24h expiry, prefilled, locked).
4. Escalation: WhatsApp notification to owner with chat context.
5. Per-business opt-in toggle (`ai_enabled`).

### Phase E: Production hardening
1. Subdomain routing: nginx + Laravel route group on subdomain. Update `ResolveBusiness` if needed.
2. Lighthouse audit, target 90+ each theme.
3. Security review: re-audit BusinessScope on every model, decrypt paths, mass assignment, CSRF on every mutating route.
4. Second active theme: finish Boutique, flip `active: true`. This validates the engine.

---

## 6. GOTCHAS / DECISIONS WORTH KNOWING

- **Marketplace is parallel, not nested.** It uses `Buyer` (not `Customer`) and its own auth. Storefront customers and marketplace buyers are separate identities.
- **Single role for now.** Owner-only. Multi-role (manager/staff) is post-launch. Don't build role plumbing yet.
- **One database, multi-tenant.** Never split tenants into separate DBs. Don't suggest it.
- **Subdomain preferred over subdirectory** for storefronts. Plan accordingly.
- **CourseFunnel uses `productFields`** in the registry to extend the product form. Boutique/Classic don't use it yet but the mechanism is there.
- **`payment_implementation_plan.md` is empty.** Superseded by `app/Services/Payments/*` actual code and this roadmap.
- **Order vs OrderItem:** orders point to order_items table (chosen the relational way, not the jsonb-line-items way).

---

## 7. WORKFLOW EXPECTATIONS (the user's collaboration rules)

- Explain the plan and get approval BEFORE writing code. Always.
- Be terse. Skip the AI fluff. Match the project's clipped style.
- Use the right Laravel skill (`laravel-best-practices`, `inertia-react-development`, `wayfinder-development`, `pest-testing`, `tailwindcss-development`, `socialite-development`) the moment you enter that domain.
- Follow Karpathy guidelines: surface assumptions, simplest solution that works, surgical edits, define success criteria.
- Use `search-docs` (Boost MCP) before guessing Laravel/Inertia API.
- Tests are not optional. Pest feature test for every change.

---

## 8. KEY FILES TO OPEN ON DAY ONE

- `BIIZZ_APP_ARCHITECTURE.md` (vision + 5 pillars + security model)
- `Theme.md` (theme engine spec)
- `CLAUDE.md` / `AGENTS.md` (Laravel Boost project rules)
- `resources/js/Themes/registry.ts` (theme registration entry point)
- `app/Models/Scopes/BusinessScope.php` (tenancy guard)
- `app/Services/Payments/PaymentGatewayFactory.php` (payment dispatch)
- `app/Http/Middleware/ResolveBusiness.php` (URL -> tenant)
- `routes/storefront.php`, `routes/admin.php`, `routes/marketplace.php`, `routes/webhooks.php`

---

*Last updated: 2026-04-27. Update this file when phase boundaries shift or new pillars land.*
