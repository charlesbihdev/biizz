# BIIZZ.APP — Full System Architecture & Vision

> *"Build biizz.app as a high-security, high-performance engine where the 'Business' is the star. Ensure every query is scoped, every key is encrypted, and every theme is structurally isolated. The goal is to make professional commerce as easy as sending a WhatsApp message."*

---

**Project Status:** Specification Phase  
**Domain:** `biizz.app`  
**Stack:** Laravel · Inertia.js v2 · React · TypeScript (Strict) · PostgreSQL 16+

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Multi-Tenant Architecture](#2-multi-tenant-architecture)
3. [The Five Pillars](#3-the-five-pillars)
4. [Technical Standards](#4-technical-standards)
5. [Database Schema](#5-database-schema)
6. [Security Model](#6-security-model)
7. [Directory Structure](#7-directory-structure)
8. [Agent Priorities](#8-agent-priorities)

---

## 1. Executive Summary

**biizz.app** is an **E-commerce OS** designed to bridge the gap between social media selling (WhatsApp / Instagram) and professional, conversion-optimised storefronts.

### The Problem

Small to medium businesses in regional markets — particularly across **Africa and Emerging Markets** — face a consistent set of blockers:

- Complex, expensive site builders not built for their context
- Disconnected payment setups requiring multiple accounts and manual reconciliation
- Hours wasted answering the same product and pricing questions on WhatsApp every day

### The Solution

A unified platform where a user logs in **once** and deploys **multiple, structurally unique Businesses**. Each business is independently equipped with:

| Capability | What it delivers |
|---|---|
| **The Look** | Structural themes (not just CSS skins) that fit the specific industry |
| **The Money** | Plug-and-play AES-256 encrypted integration for Paystack & Junipay |
| **The Brain** | Opt-in AI Commerce Agent handling queries and generating checkout links |
| **The Growth** | Native Meta Pixel integration for automated ad ROI tracking |

---

## 2. Multi-Tenant Architecture

biizz.app uses a **Single Database, Multi-Tenant** model. This approach enables rapid scaling, simpler infrastructure, and lower operational costs — critical for an emerging-market-first product.

### 2a. Identity Logic

```
User
 └── manages 1..N → Business
                        └── owns → Products, Orders, Customers, Settings
```

| Entity | Description |
|---|---|
| **User** | Authenticated via Google (Laravel Socialite) or email and password. A User *manage* one or more Business entities. |
| **Business** | The primary silo. Every data entity (Products, Orders, Customers, Settings) is hard-linked to a `business_id`. |

### 2b. The Scope Algorithm

All data isolation is enforced at two layers simultaneously — neither layer alone is sufficient.

**Backend — Eloquent Global Scope**

Every model that belongs to a business automatically appends `WHERE business_id = ?` to every query. This is implemented as a `BusinessScope` applied in the model's `booted()` method.

```php
// app/Models/Scopes/BusinessScope.php

class BusinessScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where('business_id', BusinessContext::current()->id);
    }
}
```

**Frontend — URL-Based Tenant Resolution**

The active tenant is resolved from the URL before any Inertia page is rendered.

```
biizz.app/s/{storename}          → Subdirectory routing
{storename}.biizz.app            → Subdomain routing (production)
I prefer subdomain tho
```

> **Rule:** If `business_id` cannot be resolved from the URL, the request is rejected with `403`. No fallback to a "default" business is ever permitted.

### 2c. Team Roles & Permissions

| Role | Capabilities |
|---|---|
For now we have one role for everything but we might expand it infuture..we want to ship fast first

> **Critical security rule:** Paystack and Junipay Secret Keys are never visible to any role below Owner. The decryption happens only in the request lifecycle — the key is never returned to the frontend under any circumstances.

---

## 3. The Five Pillars

---

### Pillar I — Structural Theme Engine

Themes are not CSS skins. They are **folder-based React component trees** with their own layouts, components, and schema definitions...refet to Theme.md for proper understanding and breakdown

#### Storage

Theme settings are stored as `jsonb` in the `businesses` table:

```sql
ALTER TABLE businesses
ADD COLUMN theme_settings jsonb DEFAULT '{}';

CREATE INDEX businesses_theme_settings_gin
ON businesses USING GIN (theme_settings);
```

#### Theme Schema (TypeScript)

Each theme defines the exact inputs it requires in a `schema.ts` file. The Admin Dashboard reads this schema and renders the appropriate controls — nothing is hardcoded in the UI.

```typescript
// resources/js/Themes/Boutique/schema.ts

export const BoutiqueSchema = {
  hero_image:        { type: 'file',    label: 'Main Banner',          dimensions: '1920x1080' },
  accent_color:      { type: 'color',   label: 'Primary Brand Color',  default: '#000000' },
  show_testimonials: { type: 'boolean', label: 'Display Reviews',      default: true },
  layout_style:      { type: 'select',  label: 'Grid Layout',          options: ['grid', 'masonry'] },
};
```

#### Theme Resolver (Dynamic Component Switcher)

```tsx
// resources/js/Pages/Storefront/Main.tsx

const THEME_MAP = {
  classic:  lazy(() => import('@/Themes/Classic/Layout')),
  boutique: lazy(() => import('@/Themes/Boutique/Layout')),
};

export default function Storefront({ business }: { business: Business }) {
  const SelectedTheme = THEME_MAP[business.theme_id];
  return (
    <Suspense fallback={<ThemeLoader />}>
      <SelectedTheme settings={business.theme_settings} products={business.products} />
    </Suspense>
  );
}
```

> **Rule:** Adding a new theme requires zero changes to existing code. Create the folder, register one line in `THEME_MAP`, and the entire system — Admin Dashboard, live preview, schema validation — works automatically.

---

### Pillar II — Secure Payments

#### Supported Providers

| Provider | Region | Purpose |
|---|---|---|
| **Paystack** | Nigeria, Ghana, Kenya, South Africa | Card payments, bank transfers, USSD |
| **Junipay** | West Africa | Mobile money, alternative payment rails |
will paste you the docs or libries so you dont have to start from scratch..jusk ask.

#### Encryption Standard

API Keys are **never stored in plaintext**. The entire lifecycle is:

```
User pastes key → AES-256 encrypt (Laravel Encrypter) → Store cipher text
                                                                    ↓
Payment request → Decrypt in memory → Authorize → Discard → Never return to frontend
```

```php
// Storing a key
$business->update([
    'paystack_secret' => encrypt($request->paystack_secret),
]);

// Using a key (only within request lifecycle)
$key = decrypt($business->paystack_secret);
// $key is never logged, returned, or persisted in this form
```

> **Staff permission check:** Before any key decryption, the system asserts `$user->hasRole('owner')`. Any other role throws `AuthorizationException` — never a silent failure.

---

### Pillar III — AI Commerce Agent (Opt-In)

The AI agent is the **always-on salesperson** for each business, operating
entirely within WhatsApp. It is opt-in at the business level.

> **Core principle:** 97% of the commerce journey — discovery, browsing,
> questions, cart building, and confirmation — happens inside the WhatsApp
> conversation itself. The payment link is the final handoff, not a storefront.

---

#### The WhatsApp-First Commerce Flow
```
Customer → WhatsApp message
    ↓
AI Agent responds: answers questions, suggests products,
                   handles objections, shows availability
    ↓
Agent assembles order items and lists them inline in the chat:
    ┌─────────────────────────────────┐
    │ 🛍️ Your Order Summary           │
    │                                 │
    │ • Ankara Tote Bag (Black) × 1   │
    │   GHS 85.00                     │
    │ • Wax Print Scarf × 2           │
    │   GHS 40.00 each                │
    │                                 │
    │ Total: GHS 165.00               │
    │                                 │
    │ Reply YES to confirm ✅          │
    └─────────────────────────────────┘
    ↓
Customer replies: "YES"
    ↓
System generates a unique Payment Link
Agent sends link in chat: "Here's your payment link → [link]"
    ↓
Customer opens link → sees order summary + Pay button
    ↓
Payment captured (Paystack / Junipay)
    ↓
Agent sends confirmation message back in WhatsApp
```

---

#### Agent Capabilities

| Function | Description |
|---|---|
| `searchProducts(query)` | Semantic search across the business's product catalog |
| `checkInventory(productId)` | Real-time stock check before confirming availability |
| `getBusinessInfo()` | Returns hours, location, policies for customer queries |
| `buildOrderSummary(items[])` | Assembles a formatted order list to display in WhatsApp |
| `generatePaymentLink(order)` | Creates a unique, pre-filled payment page for the confirmed order |
| `sendConfirmation(orderId)` | Posts an order confirmation message back to the customer after payment |

---

#### The Payment Link Page

This is the **only** moment the customer leaves WhatsApp. The page is
intentionally minimal — it exists solely to collect payment, not to re-sell.
```
┌──────────────────────────────────────┐
│  Pay for your order — Zara's Boutique│
│                                      │
│  Ankara Tote Bag (Black)  ×1  GHS 85 │
│  Wax Print Scarf          ×2  GHS 80 │
│  ──────────────────────────────────  │
│  Total                    GHS 165    │
│                                      │
│  [  Pay with Paystack / Junipay  ]   │
│                                      │
│  🔒 Secured by biizz.app             │
└──────────────────────────────────────┘
```

- The link is **single-use** and **expires after 24 hours**
- It is pre-filled from the WhatsApp conversation — the customer cannot modify
  the cart on this page
- After successful payment, the customer is redirected back to a confirmation
  screen and receives a WhatsApp message from the agent

---

#### Escalation Logic

The agent escalates to the human owner when:
- A question cannot be answered from product data or business info
- The customer explicitly asks to speak to a person
- Payment fails and the customer needs support

Escalation sends the business owner a WhatsApp notification with full
conversation context — they pick up exactly where the agent left off.

### Pillar IV — Marketing Intelligence (Meta Pixel)

Business owners paste their **Pixel ID once**. biizz.app handles the rest automatically.

#### Automated Event Pipeline

| Event | Trigger |
|---|---|
| `ViewContent` | Customer views a product page |
| `AddToCart` | Customer adds a product to cart |
| `InitiateCheckout` | Customer begins checkout |
| `Purchase` | Order confirmed and payment captured |

#### Implementation

A single shared React hook, used across **all themes**, ensures no event is ever missed regardless of the store's visual structure:

```typescript
// resources/js/Shared/Hooks/useMetaPixel.ts

export function useMetaPixel(pixelId: string) {
  const trackEvent = useCallback((event: PixelEvent, data?: object) => {
    if (!pixelId || typeof fbq === 'undefined') return;
    fbq('track', event, data);
  }, [pixelId]);

  return { trackEvent };
}
```

> Since the hook is in `Shared/`, it is theme-agnostic. Every Classic, Boutique, or future theme automatically inherits full pixel tracking.

---

### Pillar V — The Dynamic Admin Dashboard

The admin UI is **self-aware** — it adapts to the exact state of each business.

| Business State | Dashboard Behaviour |
|---|---|
| AI agent is OFF | AI settings tab is hidden entirely — no confusing disabled fields |
| Boutique theme active | Only Boutique schema fields render — no Classic fields visible |
| Paystack not connected | Payment analytics section shows an empty-state prompt, not broken charts |
| No products added | Orders page shows onboarding guide, not an empty table |

#### Live Preview (iframe)

As the owner adjusts `jsonb` settings in the left panel, the right panel iframe re-renders the storefront in real-time — before hitting Save.

```tsx
// The preview URL merges current unsaved state as query params
const previewUrl = `/storefront/${business.id}/preview?${
  new URLSearchParams(settingsDiff).toString()
}`;

<iframe src={previewUrl} title="Live Preview" className="w-full h-full border-0 rounded-xl" />
```

---

## 4. Technical Standards

| Category | Standard | Rationale |
|---|---|---|
| **Language** | TypeScript — Strict mode | Prevents data mismatch between Laravel jsonb payloads and React props |
| **Database** | PostgreSQL 16+ with `jsonb` | Performance, GIN indexing, schema-free settings storage |
| **Auth** | Laravel Socialite — Google OAuth | Frictionless onboarding; no password fatigue for busy merchants |
| **Data Validation** | Spatie Laravel-Data | Ensures every jsonb write is validated against the active theme's schema |
| **Frontend Build** | Vite + Tailwind CSS | Lightweight output; 90+ Lighthouse performance score target |
| **Code Splitting** | React `lazy()` per theme | Boutique visitors never download Classic theme JavaScript |
| **Encryption** | AES-256 via Laravel `Encrypter` | Industry standard; keys never stored or returned in plaintext |
| **Scoping** | Eloquent Global Scopes | Business isolation enforced at the ORM level — not just in controllers |

---

## 5. Sample Database Schema(Feel free and be creative to modify)

### Core Tables

```sql
-- Users (managed by Socialite)
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password       VARCHAR(255),
    google_id   VARCHAR(255) UNIQUE,
    avatar      TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses (the primary tenant silo)
CREATE TABLE businesses (
    id                  BIGSERIAL PRIMARY KEY,
    owner_id            BIGINT NOT NULL REFERENCES users(id),
    name                VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) UNIQUE NOT NULL,   -- used in URL routing
    theme_id            VARCHAR(50) DEFAULT 'classic',
    theme_settings      JSONB DEFAULT '{}',
    paystack_secret     TEXT,                           -- AES-256 encrypted
    junipay_secret      TEXT,                           -- AES-256 encrypted
    meta_pixel_id       VARCHAR(50),
    ai_enabled          BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX businesses_theme_settings_gin ON businesses USING GIN (theme_settings);
CREATE INDEX businesses_slug_idx ON businesses (slug);

-- Team membership
CREATE TABLE business_users (
    id          BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (business_id, user_id)
);

-- Products
CREATE TABLE products (
    id          BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       NUMERIC(12, 2) NOT NULL,
    stock       INTEGER DEFAULT 0,
    images      JSONB DEFAULT '[]',
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX products_business_id_idx ON products (business_id);

-- Orders
CREATE TABLE orders (
    id              BIGSERIAL PRIMARY KEY,
    business_id     BIGINT NOT NULL REFERENCES businesses(id),
    customer_name   VARCHAR(255),
    customer_email  VARCHAR(255),
    customer_phone  VARCHAR(50),
    items           JSONB NOT NULL DEFAULT '[]',
    total           NUMERIC(12, 2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'GHS',
    status          VARCHAR(30) DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','fulfilled','cancelled','refunded')),
    payment_ref     VARCHAR(255),
    payment_provider VARCHAR(20),
    source          VARCHAR(20) DEFAULT 'storefront'
                    CHECK (source IN ('storefront','whatsapp','instagram')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

or orders should point to order items table  choose the best way

CREATE INDEX orders_business_id_idx ON orders (business_id);
CREATE INDEX orders_status_idx ON orders (status);
```

---

## 6. Security Model

### Threat Mitigation Summary

| Threat | Mitigation |
|---|---|
| Cross-tenant data leak | Global Eloquent Scope on every model; `business_id` validated on every request |
| Exposed API keys | AES-256 encryption at rest; keys never returned to frontend; Staff role blocked at decryption layer |
| Unauthorised store access | URL-based tenant resolution with hard `403` on failure — no fallback |
| Mass assignment | All models use `$fillable` whitelist; Spatie Data Objects validate every jsonb write |
| CSRF | Laravel's default CSRF middleware applied to all state-changing routes |
| XSS via theme settings | All jsonb values are sanitised before rendering via React's default escaping |

### Encryption Flow (Detailed)

```
┌─────────────────────────────────────────────────────────┐
│                     WRITE PATH                          │
│                                                         │
│  Owner submits key → ThemeSettingsController            │
│       → assert($user->hasRole('owner'))                 │
│       → encrypt($key)  [AES-256, APP_KEY]               │
│       → store cipher in DB                              │
│       → return 200, no key data in response             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                     READ PATH                           │
│                                                         │
│  Payment request arrives → PaymentService               │
│       → assert($user->hasRole('owner'))                 │
│       → $key = decrypt($business->paystack_secret)      │
│       → authorize payment with Paystack                 │
│       → $key goes out of scope (GC'd)                   │
│       → never logged, never in response, never cached   │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Directory Structure

```
biizz.app/
│
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── StorefrontController.php
│   │   │   └── Admin/
│   │   │       ├── ThemeSettingsController.php
│   │   │       ├── PaymentController.php
│   │   │       └── AIAgentController.php
│   │   └── Middleware/
│   │       └── ResolveBusiness.php       # URL → BusinessContext
│   ├── Models/
│   │   ├── Business.php
│   │   ├── Product.php
│   │   ├── Order.php
│   │   └── Scopes/
│   │       └── BusinessScope.php         # Global tenant isolation
│   ├── Data/
│   │   └── ThemeSettingsData.php          # Spatie validation DTO
│   └── Services/
│       ├── PaymentService.php             # Decrypt + authorize
│       └── AIAgentService.php
│
├── resources/js/
│   ├── Themes/
│   │   ├── Classic/
│   │   │   ├── Layout.tsx
│   │   │   ├── schema.ts                  # Theme's input schema
│   │   │   └── Components/
│   │   └── Boutique/
│   │       ├── Layout.tsx
│   │       ├── schema.ts
│   │       └── Components/
│   ├── Shared/
│   │   ├── Hooks/
│   │   │   ├── useCart.ts
│   │   │   ├── useMetaPixel.ts
│   │   │   └── useProductData.ts
│   │   └── Components/
│   │       ├── ColorPicker.tsx
│   │       ├── FileUploader.tsx
│   │       └── Toggle.tsx
│   ├── Pages/
│   │   ├── Storefront/
│   │   │   └── Main.tsx                   # Dynamic theme resolver
│   │   └── Admin/
│   │       └── Settings.tsx               # Self-aware dashboard
│   └── types/
│       ├── theme.d.ts
│       └── business.d.ts
│
├── routes/
│   └── web.php
│
└── database/
    └── migrations/
```

---

## 8. Agent Priorities

When building biizz.app, follow these rules in strict order:

| Priority | Rule |
|---|---|
| **1** | Every Eloquent query that touches business data **must** have `BusinessScope` applied. No exceptions. |
| **2** | API keys are **never** returned to the frontend. If a controller returns key data, it is a critical bug. |
| **3** | TypeScript strict types must be maintained between the `jsonb` column and React props at all times. |
| **4** | Adding a new theme **only** requires: (a) a new theme folder, (b) one line in `THEME_MAP`, (c) entries in `ThemeSettingsData`. No other files should change. |
| **5** | Business logic (cart, payments, pixel events) lives in `Shared/Hooks/` or `Services/`. Themes only contain JSX and CSS. |
| **6** | The Admin Dashboard must always reflect the **active theme's schema** — not a hardcoded list of fields. |
| **7** | Eager-load with `->with('products')` on every storefront query. Never lazy-load in a loop. |
| **8** | Use `React.lazy()` for every theme import. Code splitting is not optional. |

---

## Suggested First Steps

```
Phase 1 → Database migrations + Models + BusinessScope
Phase 2 → Google Auth (Socialite) + Business creation flow
Phase 3 → Theme Engine (Classic theme) + Admin Dashboard schema reader
Phase 4 → Payment integration (Paystack first) + encryption layer
Phase 5 → AI Agent (opt-in) + WhatsApp webhook
Phase 6 → Meta Pixel shared hook + event pipeline
Phase 7 → Second theme (Boutique) — validates the theme engine works
Phase 8 → Performance audit (Lighthouse 90+) + security review
```

---
Your knowledge in inertia, wayfinder and latest laravel is poor...use the laravel
use the skills files in the skill folder to make sure you are doing the right thing

component based architechture

no tsx file should contain more than 200 lines unless its impossible to break it into components

extract complex logics into hooks...hooks itself could be separated in their various folders based on what they do if neccessary.

components folder should have folders for page/feature specific components...eg. components which repeats multiple sections should be in the common, and specific components for user dashboard should be placed in user/dashboard folder......and so on.

be creative, be flexible, follow industry standard, do things the laravel way and the inertia way...not the php way or reactor js way....if you feel something in this docs could be amended, ask questions and prompt me and lets plan....

*This document is the single source of truth for biizz.app. Feed it directly to your AI coding agent (Cursor, Windsurf, Claude Code) before starting any implementation phase.*
