# ARCHITECTURE_SPEC: Multi-Tenant Theme Engine
**Status:** Implementation Ready  
**Last Updated:** March 2026  

---

## Stack Versions (Verified Current)

| Technology | Version | Notes |
|---|---|---|
| **Laravel** | `^12.0` | Current stable (released Feb 24, 2025). Minimum PHP 8.2+ |
| **Inertia.js (Laravel adapter)** | `^2.0` | Current stable. v3 is in beta — **do not use in production yet** |
| **@inertiajs/react** | `^2.3.x` | Current stable npm package |
| **React** | `^18.x` | Required by Inertia v2 stable. Inertia v3 beta will require React 19+ |
| **TypeScript** | `^5.x` | Strict mode recommended |
| **PostgreSQL** | `^15.x` | Required for `jsonb` + GIN indexing |
| **Vite** | `^6.x` | Default bundler in Laravel 12 |
| **Spatie Laravel Data** | `^4.x` | For typed Data Objects / DTO validation |

> **Note on Inertia v3 (beta):** v3 drops Axios, adds a built-in XHR client, a `@inertiajs/vite` plugin that handles SSR/page resolution automatically, a `useHttp` hook, and optimistic updates. When it reaches stable, this spec should be upgraded. v3 requires Laravel 11+, React 19+, and PHP 8.2+.

---

## 1. Core Vision

This system supports multiple independent **Businesses**. Each Business selects one of several **Themes**. Themes are **not** just CSS skins — they are full structural React component overrides that each carry their own schema, layout, and components.

**One engine. Many storefronts. Zero duplication of logic.**

---

## 2. Directory Structure

```
resources/js/
├── Themes/
│   ├── Classic/                    # Theme A
│   │   ├── Layout.tsx              # Root layout component
│   │   ├── Components/             # Theme-specific UI components
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── Footer.tsx
│   │   └── schema.ts               # The "Brain" — defines what this theme needs
│   │
│   ├── Boutique/                   # Theme B
│   │   ├── Layout.tsx
│   │   ├── Components/
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── LookbookGrid.tsx
│   │   │   └── TestimonialRow.tsx
│   │   └── schema.ts
│   │
│   └── Shared/                     # Logic shared across ALL themes
│       ├── Hooks/
│       │   ├── useCart.ts          # Cart logic (add, remove, total)
│       │   ├── useProductData.ts   # Product fetching + filtering
│       │   └── useThemeSettings.ts # Access active theme settings
│       └── Components/             # Primitive UI building blocks
│           ├── Button.tsx
│           ├── Input.tsx
│           ├── ColorPicker.tsx
│           ├── FileUploader.tsx
│           └── Toggle.tsx
│
├── Pages/
│   ├── Storefront/
│   │   └── Main.tsx                # Dynamic theme resolver (see Section 5)
│   └── Admin/
│       └── Settings.tsx            # Self-aware admin dashboard (see Section 4)
│
└── types/
    ├── theme.d.ts                  # Global TypeScript types for themes
    └── business.d.ts               # Business model types
```

---

## 3. Database: `jsonb` Strategy

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

// GIN index for high-performance JSON searching
DB::statement('CREATE INDEX businesses_theme_settings_gin ON businesses USING GIN (theme_settings)');
```

### Why `jsonb` over `json`

| Feature | `json` | `jsonb` |
|---|---|---|
| Storage format | Raw text | Binary |
| Query speed | Slower | **Faster** |
| GIN indexing | ❌ Not supported | ✅ Supported |
| Duplicate key handling | Keeps duplicates | Removes redundant data |
| Schema migrations per feature | Required | **Not required** |

**Anti-Breaking Benefit:** Adding a new theme feature (e.g., a "Promo Banner") does not require a database migration — the new key is added to the schema and the Data Object only.

---

## 4. Theme Schema + Laravel Data Objects

### 4a. TypeScript Schema (Frontend "Brain")

Each theme defines exactly what settings it needs via a `schema.ts` file. The admin dashboard reads this schema to auto-generate its UI.

```typescript
// resources/js/Themes/Classic/schema.ts

export type FieldType = 'color' | 'file' | 'boolean' | 'text' | 'select';

export interface SchemaField {
  type: FieldType;
  label: string;
  default?: string | boolean;
  dimensions?: string;   // For file fields (e.g. '1920x1080')
  options?: string[];    // For select fields
}

export const ClassicSchema: Record<string, SchemaField> = {
  primary_color:      { type: 'color',   label: 'Primary Brand Color', default: '#1a1a1a' },
  hero_image:         { type: 'file',    label: 'Hero Banner Image',   dimensions: '1920x600' },
  show_featured:      { type: 'boolean', label: 'Show Featured Products', default: true },
  store_tagline:      { type: 'text',    label: 'Store Tagline',       default: 'Welcome to our store' },
};
```

```typescript
// resources/js/Themes/Boutique/schema.ts

export const BoutiqueSchema: Record<string, SchemaField> = {
  hero_image:         { type: 'file',    label: 'Main Banner',         dimensions: '1920x1080' },
  accent_color:       { type: 'color',   label: 'Primary Brand Color', default: '#000000' },
  show_testimonials:  { type: 'boolean', label: 'Display Reviews',     default: true },
  layout_style:       { type: 'select',  label: 'Grid Layout',         options: ['grid', 'masonry', 'list'] },
};
```

### 4b. Master Schema Map (TypeScript)

```typescript
// resources/js/types/theme.d.ts

import { ClassicSchema }  from '@/Themes/Classic/schema';
import { BoutiqueSchema } from '@/Themes/Boutique/schema';

export const SCHEMA_MAP = {
  classic:  ClassicSchema,
  boutique: BoutiqueSchema,
} as const;

export type ThemeId = keyof typeof SCHEMA_MAP;

export interface ThemeSettings {
  primary_color?:     string;
  accent_color?:      string;
  hero_image?:        string;
  show_featured?:     boolean;
  show_testimonials?: boolean;
  store_tagline?:     string;
  layout_style?:      string;
  [key: string]: unknown; // Allow forward-compatible unknown keys
}

export interface Business {
  id:              number;
  name:            string;
  theme_id:        ThemeId;
  theme_settings:  ThemeSettings;
  products:        Product[];
}
```

### 4c. Laravel Data Object (Backend Validator)

Maps directly to the TypeScript schema. Prevents garbage data reaching the `jsonb` column.

```php
// app/Data/ThemeSettingsData.php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Regex;

class ThemeSettingsData extends Data
{
    public function __construct(
        #[Regex('/^#[0-9A-Fa-f]{6}$/')]
        public ?string $primary_color   = null,

        #[Regex('/^#[0-9A-Fa-f]{6}$/')]
        public ?string $accent_color    = null,

        #[Max(2048)]
        public ?string $hero_image      = null,  // Stored path after upload

        public bool    $show_featured      = true,
        public bool    $show_testimonials  = true,

        #[Max(120)]
        public ?string $store_tagline   = null,
        public ?string $layout_style    = null,
    ) {}
}
```

```php
// app/Http/Controllers/Admin/ThemeSettingsController.php

namespace App\Http\Controllers\Admin;

use App\Data\ThemeSettingsData;
use App\Models\Business;
use Illuminate\Http\Request;

class ThemeSettingsController extends Controller
{
    public function update(Request $request, Business $business)
    {
        $data = ThemeSettingsData::from($request->all());

        $business->update([
            'theme_settings' => $data->toArray(),
        ]);

        return back()->with('success', 'Theme settings saved.');
    }
}
```

---

## 5. Dynamic Admin Dashboard (Self-Aware UI)

The Admin UI does **not** hardcode any inputs. It:

1. **Fetches** the active theme's schema on mount
2. **Loops** through schema fields and renders the matching component
3. **Previews** changes in real-time via an `<iframe>`

```tsx
// resources/js/Pages/Admin/Settings.tsx

import React, { useState } from 'react';
import { usePage, router }  from '@inertiajs/react';
import { SCHEMA_MAP }       from '@/types/theme.d';
import ColorPicker          from '@/Shared/Components/ColorPicker';
import FileUploader         from '@/Shared/Components/FileUploader';
import Toggle               from '@/Shared/Components/Toggle';
import { Business }         from '@/types/business.d';

const FIELD_COMPONENT_MAP = {
  color:   ColorPicker,
  file:    FileUploader,
  boolean: Toggle,
  text:    (props: any) => <input type="text" {...props} className="input" />,
  select:  (props: any) => (
    <select {...props} className="select">
      {props.options?.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  ),
};

export default function Settings({ business }: { business: Business }) {
  const schema   = SCHEMA_MAP[business.theme_id];
  const [settings, setSettings] = useState(business.theme_settings);

  const handleChange = (key: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    router.patch(`/admin/businesses/${business.id}/theme`, settings);
  };

  const previewUrl = `/storefront/${business.id}/preview?${new URLSearchParams(
    Object.entries(settings).reduce((acc, [k, v]) => {
      acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>)
  ).toString()}`;

  return (
    <div className="admin-settings-layout">

      {/* --- Dynamic Form Panel --- */}
      <aside className="settings-panel">
        <h2>Theme Settings — {business.theme_id}</h2>

        {Object.entries(schema).map(([key, field]) => {
          const Component = FIELD_COMPONENT_MAP[field.type];
          return (
            <div key={key} className="field-group">
              <label>{field.label}</label>
              <Component
                value={settings[key] ?? field.default}
                options={field.options}
                onChange={(val: unknown) => handleChange(key, val)}
              />
            </div>
          );
        })}

        <button onClick={handleSave}>Save Settings</button>
      </aside>

      {/* --- Live Preview Iframe --- */}
      <main className="preview-panel">
        <iframe
          src={previewUrl}
          title="Storefront Preview"
          className="w-full h-full border-0"
        />
      </main>

    </div>
  );
}
```

---

## 6. Theme Switcher: Dynamic Component Resolver

No `if/else` chains. Uses a `THEME_MAP` lookup to resolve the correct layout component at runtime.

```tsx
// resources/js/Pages/Storefront/Main.tsx

import React, { lazy, Suspense } from 'react';
import { Business }              from '@/types/business.d';

// Code splitting: visitors only download the JS for their active theme
const Classic  = lazy(() => import('@/Themes/Classic/Layout'));
const Boutique = lazy(() => import('@/Themes/Boutique/Layout'));

const THEME_MAP = {
  classic:  Classic,
  boutique: Boutique,
} as const;

interface Props {
  business: Business;
}

export default function Storefront({ business }: Props) {
  const SelectedTheme = THEME_MAP[business.theme_id];

  if (!SelectedTheme) {
    return <div>Theme not found: {business.theme_id}</div>;
  }

  return (
    <Suspense fallback={<div className="theme-loading">Loading...</div>}>
      <SelectedTheme
        settings={business.theme_settings}
        products={business.products}
      />
    </Suspense>
  );
}
```

---

## 7. Shared Logic — The Hooks Pattern

**Rule:** Never rewrite business logic inside a theme. The visual layer (JSX/CSS) changes between themes. The *logic* does not.

```typescript
// resources/js/Shared/Hooks/useCart.ts

import { useState, useCallback } from 'react';
import { router }                from '@inertiajs/react';

export interface CartItem {
  id:       number;
  name:     string;
  price:    number;
  quantity: number;
}

export function useCart(initialItems: CartItem[] = []) {
  const [items, setItems] = useState<CartItem[]>(initialItems);

  const addToCart = useCallback((product: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const checkout = useCallback(() => {
    router.post('/cart/checkout', { items });
  }, [items]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return { items, addToCart, removeFromCart, checkout, total };
}
```

Usage is identical in every theme:

```tsx
// Inside Classic/Layout.tsx  OR  Boutique/Layout.tsx — same hook, different UI

import { useCart } from '@/Shared/Hooks/useCart';

export default function Layout({ settings, products }) {
  const { items, addToCart, total } = useCart();

  return (
    // ... theme-specific JSX, calling addToCart from the shared hook
  );
}
```

---

## 8. Eloquent Model

```php
// app/Models/Business.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Business extends Model
{
    protected $fillable = [
        'name',
        'theme_id',
        'theme_settings',
    ];

    protected $casts = [
        'theme_settings' => 'array', // Laravel auto-encodes/decodes jsonb <-> PHP array
    ];

    // Eager load everything needed for storefront in one query
    public function scopeWithStorefrontData($query)
    {
        return $query->with('products');
    }
}
```

---

## 9. Routes

```php
// routes/web.php

use App\Http\Controllers\StorefrontController;
use App\Http\Controllers\Admin\ThemeSettingsController;

// Public storefront
Route::get('/store/{business}',            [StorefrontController::class, 'show']);
Route::get('/storefront/{business}/preview', [StorefrontController::class, 'preview']);

// Admin (protected)
Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::get('/businesses/{business}/settings',
        [ThemeSettingsController::class, 'edit'])->name('admin.settings.edit');
    Route::patch('/businesses/{business}/theme',
        [ThemeSettingsController::class, 'update'])->name('admin.settings.update');
});
```

---

## 10. Controllers

```php
// app/Http/Controllers/StorefrontController.php

namespace App\Http\Controllers;

use App\Models\Business;
use Inertia\Inertia;

class StorefrontController extends Controller
{
    public function show(Business $business)
    {
        // Single query — Business + Products
        $business->load('products');

        return Inertia::render('Storefront/Main', [
            'business' => $business,
        ]);
    }

    public function preview(Business $business)
    {
        // Merge query-string overrides for live preview
        $business->theme_settings = array_merge(
            $business->theme_settings ?? [],
            request()->only(array_keys($business->theme_settings ?? []))
        );

        $business->load('products');

        return Inertia::render('Storefront/Main', [
            'business' => $business,
        ]);
    }
}
```

---

## 11. Performance & Scalability

### GIN Index (PostgreSQL)

```sql
-- Enables high-speed searches inside the jsonb column
CREATE INDEX businesses_theme_settings_gin
ON businesses
USING GIN (theme_settings);

-- Example: Find all businesses using a specific accent color
SELECT * FROM businesses
WHERE theme_settings @> '{"accent_color": "#FF0000"}';
```

### Code Splitting with React `lazy()`

Each theme is a separate JS chunk. A visitor to a Classic storefront **never downloads** the Boutique theme bundle.

```tsx
const Classic  = lazy(() => import('@/Themes/Classic/Layout'));   // ~20kb chunk
const Boutique = lazy(() => import('@/Themes/Boutique/Layout'));  // separate chunk
```

### Eager Loading

```php
// One DB hit for everything the storefront needs
Business::with('products')->findOrFail($id);
```

---

## 12. Adding Theme #3 — Checklist

When adding a new theme (e.g., **Minimal**), only these steps are required:

- [ ] Create `resources/js/Themes/Minimal/` directory
- [ ] Add `Layout.tsx` — the root layout component
- [ ] Add `Components/` — theme-specific UI components
- [ ] Add `schema.ts` — define what settings this theme needs
- [ ] Add `Minimal` to `SCHEMA_MAP` in `types/theme.d.ts`
- [ ] Add `Minimal` to `THEME_MAP` in `Pages/Storefront/Main.tsx` (one line)
- [ ] Add new fields to `ThemeSettingsData.php` if the schema requires them
- [ ] **No database migration required** ✅

---

## 13. Environment & Installation

```bash
# Laravel 12 + Inertia v2 + React
composer require laravel/framework:^12.0
composer require inertiajs/inertia-laravel:^2.0
composer require spatie/laravel-data:^4.0

npm install @inertiajs/react@^2.3
npm install react@^18 react-dom@^18
npm install --save-dev typescript @types/react @types/react-dom

# Publish Inertia middleware
php artisan inertia:middleware

# Run migrations
php artisan migrate
```

```env
# .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=your_db
DB_USERNAME=your_user
DB_PASSWORD=your_password
```

---

## 14. Agent Summary & Priorities

| Priority | Instruction |
|---|---|
| **1** | Maintain strict TypeScript types between the `jsonb` column and React props at all times |
| **2** | Never write business logic (cart, auth, data fetching) inside a Theme — use Shared Hooks |
| **3** | Never use `if/else` for theme switching — always use `THEME_MAP` lookup |
| **4** | The `schema.ts` in each theme is the single source of truth for what that theme accepts |
| **5** | Adding a new theme must only require adding files, not changing existing ones (Open/Closed Principle) |
| **6** | All `jsonb` writes must pass through a `ThemeSettingsData` object — no raw array writes |
| **7** | Always eager-load with `->with('products')` — never lazy-load in loops |
| **8** | Use `React.lazy()` for every theme import in `Storefront/Main.tsx` |

---

*This file is the single source of truth for this system. Feed it directly to your AI agent or IDE (Cursor, Windsurf, Claude Code) before starting implementation.*
