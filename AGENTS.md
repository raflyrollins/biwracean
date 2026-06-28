# AGENTS.md

## Stack

Laravel 13 + Inertia 3 + React 19 + TypeScript + Tailwind 4 + Vite 8.  
PHP 8.3+, Node 22. **MySQL in dev** (`.env`), **SQLite `:memory:` in tests** (`phpunit.xml`).  
Session/queue/cache all use `database` driver.

## Commands

| Scope | Command | What it runs |
|-------|---------|-------------|
| dev | `composer dev` | `php artisan serve` + `queue:listen` + `npm run dev` (concurrently) |
| full suite | `composer test` | `config:clear` → `pint --test` → `phpstan analyse` → `php artisan test` |
| php lint | `composer lint` / `composer lint:check` | `pint --parallel` / `pint --parallel --test` |
| php types | `composer types:check` | `phpstan analyse` (level 7) |
| ci | `composer ci:check` | `npm run lint:check` + `format:check` + `types:check` + `composer test` |
| js lint | `npm run lint` / `npm run lint:check` | ESLint (flat config) |
| js format | `npm run format` / `npm run format:check` | Prettier (only `resources/`) |
| js types | `npm run types:check` | `tsc --noEmit` |
| build | `npm run build` / `npm run build:ssr` | Vite / Vite + SSR |
| setup | `composer setup` | `composer install` → copy `.env` → `key:generate` → `migrate` → `npm install` → `npm run build` |

**CI** (`.github/workflows/tests.yml`) runs `npm run build` before `php artisan test` — Vite build is required.

## Database

- **Dev:** MySQL via `APP_URL=http://biwracean.test` (Laravel Herd).
- **Test:** SQLite `:memory:` (set in `phpunit.xml`), `RefreshDatabase` opt-in per file.
- **Seed:** `php artisan db:seed` creates default admin + roles.  
  Default admin: `admin@biwracean.com` / `password` (superadmin role with all permissions).
- **Seeders run in order:** Role → TicketClass → Port → Ship → Route → Sailing → TicketAvailability.

## Tests

Pest 4. SQLite `:memory:`. Feature tests extend `Tests\TestCase`.
`RefreshDatabase` is **not** used by default — opt in per test:
```php
pest()->extend(TestCase::class)->use(RefreshDatabase::class)->in('Feature');
```
Run a single test: `php artisan test tests/Feature/ExampleTest.php`.

## Architecture

Ferry ticket booking system with 3 surfaces:

| Surface | Route | Auth |
|---------|-------|------|
| **Public landing** | `GET /` → `public/landing.tsx` | None |
| **Admin panel** | `/admin/*` → Inertia pages in `pages/admin/` | `auth:web` + `admin` middleware (checks `is_admin` + `role.permissions`) |
| **Mobile API** | `/api/*` → JSON (Sanctum tokens) | `auth:sanctum` |

### Backend entrypoints
- `bootstrap/app.php` wires web/api/channels/console routes, Inertia middleware, guest redirect to `/admin/login`
- `routes/web.php`: admin CRUD for ships, ports, routes, sailings, ticket-classes, ticket-availabilities, users, roles, ticket-orders
- `routes/api.php`: register/login/sailings (public), ticket-orders CRUD + pay/upload-proof/validate/cancel (auth:sanctum)
- `routes/channels.php`: broadcast channels `admin.ticket-orders` and `admin.ticket-stock` (both require `is_admin`)
- `routes/console.php`: `CancelPendingOrders` runs every minute

### Domain model
- **Ship** → has ticket classes (pivot `ship_ticket_class`)
- **Port** → used in **Route** (origin/destination)
- **Sailing** → has **SailingLegs** (ordered legs referencing a Route), belongs to Ship
- **TicketClass** → linked to Route via **TicketAvailability** (date, price, stock per route+ticket-class)
- **TicketOrder** → belongs to User + Sailing + SailingLeg + TicketClass, status workflow: `pending` → `paid` → `validated` | `cancelled`
- **Role** → permissions array (e.g. `['dashboard', 'ships', 'ticket_orders']`), superadmin has `['*']`

### Frontend entrypoints
- `resources/js/app.tsx` — Inertia + React boot, Reverb/Echo setup
- `resources/views/app.blade.php` — shell with dark-mode script, fonts, Inertia head
- Pages: `pages/public/landing.tsx`, `pages/admin/*` (dashboard, CRUD pages), `pages/admin/rute/` (misspelling of routes)
- Layouts: `layouts/AdminLayout.tsx`, `layouts/PublicLayout.tsx`
- Auth shared via Inertia props: `{ auth: { user, permissions } }`, typed in `types/global.d.ts`

## Frontend conventions

- Path alias `@/` → `resources/js/*`
- `cn()` via `clsx` + `tailwind-merge` (`lib/utils.ts`)
- Wayfinder generates typed route definitions (`resources/js/wayfinder/index.ts`, `resources/js/routes/`, `resources/js/actions/`) — **do not edit manually**
- React Compiler via `babel-plugin-react-compiler`
- Reverb broadcasting via `@laravel/echo-react` + `pusher-js`
- ESLint enforces import ordering, consistent type imports (`type-imports` with `separate-type-imports`), brace style `1tbs`, padding around control statements, `curly: ['error', 'all']`
- ESLint ignores: `vendor/`, `node_modules/`, `public/`, `bootstrap/ssr/`, `vite.config.ts`, `resources/js/actions/**`, `resources/js/components/ui/*`, `resources/js/routes/**`, `resources/js/wayfinder/**`
- Prettier tailwind functions: `clsx`, `cn`, `cva`
- Prettier ignored: `resources/js/components/ui/*`, `resources/views/mail/*`
- Inertia SSR enabled (default port 13714)
- Dark mode via `.dark` class on `<html>`, `ThemeProvider` context component
- Design tokens as CSS custom properties in `resources/css/app.css` (brand, status, neutral, text, border colors + shadows)
- Fonts: Gabarito (sans), Courier Prime (monospace) via Bunny CDN

## Realtime (Reverb)

Requires 3 terminals: `php artisan serve` + `php artisan queue:listen` + `php artisan reverb:start`.  
If using Herd, only queue + reverb are needed.  
Events: `TicketOrderCreated`, `TicketOrderStatusChanged`, `PaymentProofUploaded`, `TicketStockUpdated` — all broadcast to `admin.ticket-orders` or `admin.ticket-stock` private channels.  
See `TESTING_REALTIME.md` for full workflow.

## Debug notes

| File | Contents |
|------|----------|
| `DEBUG.md` | Route data tidak muncul di response order — fix untuk `Api\TicketOrderController` |

## Reference docs

| File | Contents |
|------|----------|
| `API_REFERENCE.md` | Mobile API endpoints (Sanctum), request/response shapes, status flow |
| `DESIGN_GUIDE.md` | Design tokens, component specs (cards, inputs, buttons, badges) for mobile app |
| `TESTING_REALTIME.md` | Reverb setup and real-time event testing workflow |

## Tooling notes

- `opencode.json` enables `laravel-boost` MCP (run `php artisan boost:mcp`)
- `boost.json`: MCP on, Nightwatch off, Sail off, cloud off
- EditorConfig: 4-space indent, LF line endings
- `pnpm-workspace.yaml` exists but CI uses `npm` — prefer npm unless adding deps
- `npmrc` has `ignore-scripts=true`
