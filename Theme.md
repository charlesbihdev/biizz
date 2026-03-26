# ARCHITECTURE_SPEC: Multi-Tenant Theme Engine
**Status:** Implementation Ready
**Last Updated:** March 2026

---

## Stack Versions (Verified Current)

| Technology | Version | Notes |
|---|---|---|
| **Laravel** | `^13.0` | Current stable. PHP 8.4+ |
| **Inertia.js (Laravel adapter)** | `^2.0` | Current stable |
| **@inertiajs/react** | `^2.3.x` | Current stable npm package |
| **React** | `^19.x` | Current stable |
| **TypeScript** | `^5.x` | Strict mode recommended |
| **SQLite** | Default | Production may upgrade to PostgreSQL 16+ for `jsonb` + GIN indexing |
| **Vite** | `^8.x` | Default bundler |
| **Spatie Laravel Data** | `^4.x` | For typed Data Objects / DTO validation |

---

## 1. Core Vision

This system supports multiple independent **Businesses**. Each Business selects one of several **Themes**. Themes are **not** just CSS skins — they are full structural React component overrides that each carry their own schema, layout, pages, and components.

**One engine. Many storefronts. Zero duplication of logic.**

### The Fundamental Rule

> **Themes own ALL UI. Shared owns ALL logic.**

- A **theme** decides *how things look* — its layout, header, footer, cart display (drawer, page, dropdown — its choice), checkout form, product grid, etc.
- **Shared hooks** provide *what things do* — cart state, checkout submission, product filtering, analytics tracking.
- Themes are never forced to use a specific component. They import shared hooks and render however they want.

---

## 2. Directory Structure

```
resources/js/
├── Themes/
│   ├── Classic/                     # Theme A — owns ALL its UI
│   │   ├── index.ts                 # Theme registry (exports component map)
│   │   ├── Layout.tsx               # Homepage / root layout
│   │   ├── ThemeShell.tsx           # Header + footer + nav wrapper
│   │   ├── schema.ts               # The "Brain" — defines what settings this theme needs
│   │   └── Components/              # ALL Classic-specific UI
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── HeroSection.tsx
│   │       ├── ProductGrid.tsx
│   │       ├── CartDrawer.tsx       # Classic chose a sliding drawer for cart
│   │       ├── Checkout.tsx         # Classic's checkout page layout
│   │       ├── ShopPage.tsx
│   │       ├── ProductDetailPage.tsx
│   │       ├── ContactPage.tsx
│   │       └── ContentPage.tsx
│   │
│   ├── Boutique/                    # Theme B (future) — completely different UI
│   │   ├── index.ts
│   │   ├── Layout.tsx
│   │   ├── ThemeShell.tsx
│   │   ├── schema.ts
│   │   └── Components/
│   │       ├── Header.tsx
│   │       ├── CartPage.tsx         # Boutique might use a full page for cart
│   │       ├── Checkout.tsx         # Different checkout layout, same hook
│   │       └── ...
│   │
│   └── Shared/                      # Logic ONLY — no UI components
│       ├── Hooks/
│       │   ├── useCart.ts           # Cart state (add, remove, total, itemCount)
│       │   ├── useCheckout.ts       # Checkout submission logic
│       │   ├── useProductData.ts    # Product fetching + filtering
│       │   └── useMetaPixel.ts      # Analytics tracking
│       ├── StorefrontHead.tsx       # <head> meta tags (SEO, OG — truly theme-agnostic)
│       └── palettes.ts              # Color palette definitions (data, not UI)
│
├── pages/
│   └── Storefront/                  # Thin resolvers — NO theme logic
│       ├── Main.tsx                 # → resolves to Classic/Layout or Boutique/Layout
│       ├── Shop.tsx                 # → resolves to Classic/ShopPage or Boutique/ShopPage
│       ├── Product.tsx              # → resolves to Classic/ProductDetailPage or ...
│       ├── Checkout.tsx             # → resolves to Classic/Checkout or ...
│       ├── Contact.tsx              # → resolves to Classic/ContactPage or ...
│       └── Page.tsx                 # → resolves to Classic/ContentPage or ...
│
├── stores/
│   └── cartStore.ts                 # Zustand cart store (persisted to localStorage)
│
└── types/
    ├── theme.ts                     # SCHEMA_MAP, ThemeId
    └── business.ts                  # Business, Product, CartItem, ThemeSettings, etc.
```

### What goes where

| Location | Contains | Example |
|---|---|---|
| `Themes/{Name}/Components/` | All UI for that theme | CartDrawer, Header, Checkout, ShopPage |
| `Themes/{Name}/ThemeShell.tsx` | Theme's header + footer + nav wrapper | Wraps page content with theme chrome |
| `Themes/{Name}/schema.ts` | What settings this theme accepts | color_scheme, hero_image, show_featured |
| `Themes/{Name}/index.ts` | Component registry for the resolver | `{ Layout, Shop, Product, Checkout, ... }` |
| `Themes/Shared/Hooks/` | Business logic hooks — no UI | useCart, useCheckout, useProductData |
| `Themes/Shared/` (root) | Truly theme-agnostic utilities | StorefrontHead (SEO), palettes.ts (data) |
| `pages/Storefront/` | Thin resolvers — pick the right theme component | No if/else, no UI, just THEME_MAP lookup |

---

## 3. Theme Registry & Resolver Pattern

### 3a. Theme Registry (each theme exports its component map)

Every theme exports a single object mapping page names to components. This is the **only** thing the resolver system needs to know about a theme.

```typescript
// resources/js/Themes/Classic/index.ts

import Layout            from './Layout';
import ShopPage          from './Components/ShopPage';
import ProductDetailPage from './Components/ProductDetailPage';
import Checkout          from './Components/Checkout';
import ContactPage       from './Components/ContactPage';
import ContentPage       from './Components/ContentPage';

export default {
    Layout,
    Shop:     ShopPage,
    Product:  ProductDetailPage,
    Checkout,
    Contact:  ContactPage,
    Page:     ContentPage,
};
```

### 3b. Master Theme Map (with code splitting)

```typescript
// resources/js/types/theme.ts

import { lazy } from 'react';
import { ClassicSchema }  from '@/Themes/Classic/schema';
import { BoutiqueSchema } from '@/Themes/Boutique/schema';

// Code splitting: each theme is a separate JS chunk.
// A visitor to a Classic store NEVER downloads Boutique code.
export const THEME_MAP = {
    classic:  lazy(() => import('@/Themes/Classic')),
    boutique: lazy(() => import('@/Themes/Boutique')),
} as const;

export const SCHEMA_MAP = {
    classic:  ClassicSchema,
    boutique: BoutiqueSchema,
} as const;

export type ThemeId = keyof typeof SCHEMA_MAP;
```

### 3c. Storefront Resolvers (thin — no if/else, no UI)

Every storefront page follows the same pattern: look up the theme, render the component, pass props. **No if/else chains. Ever.**

```tsx
// resources/js/pages/Storefront/Main.tsx

import { Suspense } from 'react';
import { THEME_MAP } from '@/types/theme';
import StorefrontHead from '@/Themes/Shared/StorefrontHead';
import type { Business, Page, PaginatedData, Product } from '@/types/business';

type Props = {
    business: Business;
    products: PaginatedData<Product>;
    pages:    Page[];
    isPreview?: boolean;
};

export default function StorefrontMain({ business, products, pages, isPreview }: Props) {
    const Theme = THEME_MAP[business.theme_id];

    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <StorefrontHead business={business} />
            <Theme.Layout business={business} products={products} pages={pages} />
        </Suspense>
    );
}
```

```tsx
// resources/js/pages/Storefront/Checkout.tsx — same pattern

import { Suspense } from 'react';
import { THEME_MAP } from '@/types/theme';
import StorefrontHead from '@/Themes/Shared/StorefrontHead';
import type { Business, Page } from '@/types/business';

type Props = {
    business: Business;
    pages:    Page[];
};

export default function StorefrontCheckout({ business, pages }: Props) {
    const Theme = THEME_MAP[business.theme_id];

    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <StorefrontHead business={business} title="Checkout" />
            <Theme.Checkout business={business} pages={pages} />
        </Suspense>
    );
}
```

Every resolver is identical in shape. Add a new theme: zero changes to resolvers.
Add a new storefront page: one new resolver + one component per theme.

---

## 4. Database: `jsonb` Strategy

### Migration

```php
// database/migrations/xxxx_create_businesses_table.php

Schema::create('businesses', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('theme_id')->default('classic'); // e.g. 'classic' | 'boutique'
    $table->jsonb('theme_settings')->default('{}'); // Typed via Data Objects
    $table->timestamps();
});
```

### Why `jsonb` over `json`

| Feature | `json` | `jsonb` |
|---|---|---|
| Storage format | Raw text | Binary |
| Query speed | Slower | **Faster** |
| GIN indexing | Not supported | Supported |
| Schema migrations per feature | Required | **Not required** |

**Anti-Breaking Benefit:** Adding a new theme feature (e.g., a "Promo Banner") does not require a database migration — the new key is added to the schema and the Data Object only.

> **Note:** SQLite stores JSON as text. The `jsonb` benefits (GIN index, binary storage) apply when upgrading to PostgreSQL. The architecture works with both — no code changes needed.

---

## 5. Theme Schema + Laravel Data Objects

### 5a. TypeScript Schema (Frontend "Brain")

Each theme defines exactly what settings it needs via a `schema.ts` file. The admin dashboard reads this schema to auto-generate its UI.

```typescript
// resources/js/Themes/Classic/schema.ts

import type { ThemeSchema } from '@/types/business';

export const ClassicSchema: ThemeSchema = {
    color_scheme:     { type: 'palette', label: 'Brand Color Scheme' },
    hero_image:       { type: 'file',    label: 'Hero Banner Image',          dimensions: '1920x600' },
    show_hero:        { type: 'boolean', label: 'Show Hero Banner',           default: true },
    products_per_page:{ type: 'select',  label: 'Products per page',          options: ['12', '24', '36'], default: '24' },
    show_featured:    { type: 'boolean', label: 'Show Featured Products Section', default: true },
    show_shop_page:   { type: 'boolean', label: 'Enable dedicated Shop page', default: true },
};
```

### 5b. Laravel Data Object (Backend Validator)

Maps to the union of all theme schemas. Prevents garbage data reaching the database.

```php
// app/Data/ThemeSettingsData.php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Regex;
use Spatie\LaravelData\Attributes\Validation\In;

class ThemeSettingsData extends Data
{
    public function __construct(
        // Classic fields
        public ?string $color_scheme     = null,
        #[Max(2048)]
        public ?string $hero_image       = null,
        public ?bool   $show_hero        = true,
        #[In(['12', '24', '36'])]
        public ?string $products_per_page = '24',
        public ?bool   $show_featured    = true,
        public ?bool   $show_shop_page   = true,

        // Boutique fields (added when Boutique is built)
        #[Regex('/^#[0-9A-Fa-f]{6}$/')]
        public ?string $accent_color     = null,
        public ?bool   $show_testimonials = true,
        #[In(['grid', 'masonry', 'list'])]
        public ?string $layout_style     = null,
    ) {}
}
```

**Rule:** Every field that appears in any `schema.ts` MUST also appear in `ThemeSettingsData`. They must stay in sync. The TypeScript `ThemeSettings` interface in `types/business.ts` must also include all fields.

---

## 6. Shared Logic — Hooks Only

**Rule:** Never write business logic inside a theme. Themes call shared hooks and render the results however they want.

`Themes/Shared/` contains **only hooks and theme-agnostic utilities** — never UI components. If it renders JSX that a theme might want to look different, it belongs in the theme.

### Cart Hook

```typescript
// resources/js/Themes/Shared/Hooks/useCart.ts
// (or use Zustand store at stores/cartStore.ts — either pattern works,
//  as long as there is ONE source of truth for cart state)

// Provides: items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount
// Persists to localStorage so cart survives page navigation
```

Usage is identical in every theme — only the UI differs:

```tsx
// Classic chose a sliding drawer
import { useCartStore } from '@/stores/cartStore';

function ClassicCartDrawer() {
    const { items, removeFromCart, total, itemCount } = useCartStore();
    return (/* sliding drawer UI */);
}
```

```tsx
// Boutique might use a dedicated page
import { useCartStore } from '@/stores/cartStore';

function BoutiqueCartPage() {
    const { items, removeFromCart, total, itemCount } = useCartStore();
    return (/* full page table UI */);
}
```

Same hook. Same data. Completely different presentation.

### Checkout Hook

```typescript
// resources/js/Themes/Shared/Hooks/useCheckout.ts

// Provides: submitOrder, isSubmitting, errors
// Handles: POST to /s/{slug}/checkout, validation, redirect on success
// Does NOT decide: what the form looks like, how fields are arranged, button styles
```

### Other Shared Hooks

| Hook | Provides | Themes decide |
|---|---|---|
| `useCart` | Cart state + actions | Drawer vs page vs dropdown |
| `useCheckout` | Order submission + validation | Form layout, field arrangement, button styles |
| `useProductData` | Filtering, sorting, pagination | Grid vs list vs masonry |
| `useMetaPixel` | Facebook pixel event tracking | (No UI decision needed) |

### Shared Utilities (not hooks)

These live in `Themes/Shared/` root because they are truly theme-agnostic:

- `StorefrontHead.tsx` — Sets `<head>` meta tags (SEO, OG tags). No visible UI.
- `palettes.ts` — Color palette data. Pure data, no rendering.

---

## 7. Checkout Flow

### Route (one route, theme resolver handles the rest)

```php
// routes/storefront.php

Route::get('/{business:slug}/checkout', [StorefrontController::class, 'checkout'])
    ->name('storefront.checkout');

Route::post('/{business:slug}/checkout', [StorefrontController::class, 'submitCheckout'])
    ->name('storefront.checkout.submit');
```

### Controller

```php
// StorefrontController.php

public function checkout(Business $business)
{
    return Inertia::render('Storefront/Checkout', [
        'business' => $business,
        'pages'    => $business->pages()->where('is_published', true)->get(),
    ]);
}
```

### Frontend

The resolver (`pages/Storefront/Checkout.tsx`) picks `Theme.Checkout`. The theme's Checkout component:
1. Reads cart state from `useCart` hook
2. Collects customer info (name, email, phone)
3. Calls `useCheckout().submitOrder()` on submit
4. The theme decides the layout, styling, and UX flow

What happens *after* checkout (payment, confirmation page) will be defined later.

---

## 8. Progress Bar (Theme-Aware)

The Inertia progress bar color should match the active context:

```tsx
// resources/js/app.tsx

createInertiaApp({
    progress: {
        color: '#4B5563', // default for non-storefront pages (app, dashboard, landing)
    },
});
```

For storefront pages, override the progress bar color dynamically based on the business's theme settings (e.g., `primary_color` or the palette's primary). Non-storefront pages (dashboard, settings, landing page) use the app default.

---

## 9. Admin Dashboard (Self-Aware UI)

The Admin theme settings page reads the active theme's `schema.ts` and auto-generates form controls. Nothing is hardcoded — if a field isn't in the schema, it won't appear.

This page lives in `pages/Admin/Theme/Settings.tsx` (part of the app, not the storefront themes). It imports `SCHEMA_MAP` to know what fields each theme needs.

---

## 10. Eloquent Model

```php
// app/Models/Business.php (relevant fields only)

protected $casts = [
    'theme_settings' => 'array', // Laravel auto-encodes/decodes JSON <-> PHP array
];

// Eager load everything needed for storefront in one query
public function scopeWithStorefrontData($query)
{
    return $query->with(['products', 'categories', 'pages']);
}
```

---

## 11. Performance & Scalability

### Code Splitting with React `lazy()`

Each theme is a separate JS chunk. A visitor to a Classic storefront **never downloads** the Boutique theme bundle.

```tsx
const THEME_MAP = {
    classic:  lazy(() => import('@/Themes/Classic')),   // separate chunk
    boutique: lazy(() => import('@/Themes/Boutique')),  // separate chunk
};
```

### Eager Loading

```php
// One DB hit for everything the storefront needs
Business::withStorefrontData()->findOrFail($id);
```

---

## 12. Adding Theme #3 — Checklist

When adding a new theme (e.g., **Minimal**), only these steps are required:

- [ ] Create `resources/js/Themes/Minimal/` directory
- [ ] Add `schema.ts` — define what settings this theme needs
- [ ] Add `index.ts` — export the component registry (`{ Layout, Shop, Product, Checkout, ... }`)
- [ ] Add `Layout.tsx`, `ThemeShell.tsx`, and all `Components/`
- [ ] Each component imports shared hooks (`useCart`, `useCheckout`, etc.) for logic
- [ ] Add `Minimal` to `THEME_MAP` in `types/theme.ts` (one line)
- [ ] Add `Minimal` to `SCHEMA_MAP` in `types/theme.ts` (one line)
- [ ] Add new fields to `ThemeSettingsData.php` if the schema requires them
- [ ] Add new fields to `ThemeSettings` interface in `types/business.ts`
- [ ] **No database migration required**
- [ ] **No changes to any storefront resolver page**
- [ ] **No changes to any existing theme**

---

## 13. Three Sources of Truth (Must Stay in Sync)

| Source | Location | Role |
|---|---|---|
| Theme `schema.ts` | `Themes/{Name}/schema.ts` | Defines what a theme accepts (frontend source of truth) |
| `ThemeSettings` interface | `types/business.ts` | TypeScript type safety (union of ALL theme fields) |
| `ThemeSettingsData` DTO | `app/Data/ThemeSettingsData.php` | Backend validation (union of ALL theme fields) |

When adding a field to any schema, also add it to the other two. Drift between these three causes runtime bugs.

---

## 14. Agent Summary & Priorities

| Priority | Instruction |
|---|---|
| **1** | **Themes own all UI, Shared owns all logic.** Never put UI components in Shared. Never put business logic in a theme. |
| **2** | **No if/else for theme switching — ever.** All storefront pages use `THEME_MAP` lookup via the resolver pattern. |
| **3** | The `schema.ts` in each theme is the single source of truth for what that theme accepts. |
| **4** | Keep the three sources of truth in sync: `schema.ts` ↔ `ThemeSettings` ↔ `ThemeSettingsData`. |
| **5** | Adding a new theme must only require adding files + two lines in `types/theme.ts`. No changes to resolvers, controllers, or existing themes. |
| **6** | All `jsonb` writes must pass through a `ThemeSettingsData` object — no raw array writes. |
| **7** | Use `React.lazy()` for every theme import. Visitors only download their active theme. |
| **8** | Always eager-load with `->withStorefrontData()` — never lazy-load in loops. |
| **9** | Themes are never forced to use specific pages or components. A theme can display cart as a drawer, a page, a modal — its choice. |

---

*This file is the single source of truth for the theme engine architecture. Feed it directly to your AI agent or IDE before starting implementation.*
