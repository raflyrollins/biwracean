# AGENTS.md

## Stack

Laravel 13 + Inertia 3 + React 19 + TypeScript + Tailwind 4 + Vite 8.  
PHP 8.3+, Node 22. SQLite default (session/queue/cache all use `database` driver).

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
| setup | `composer setup` | install → copy `.env` → key:generate → migrate → `npm install` → `npm run build` |

## Tests

Pest 4. SQLite `:memory:`. Feature tests extend `Tests\TestCase`. `RefreshDatabase` is **not** used by default — opt in per test via `->use(RefreshDatabase::class)` in `Pest.php` or per-file.  
Run a single test: `php artisan test tests/Feature/ExampleTest.php`.

## Frontend conventions

- Path alias `@/` → `resources/js/*`
- `cn()` via `clsx` + `tailwind-merge` (`resources/js/lib/utils.ts`)
- Inertia pages in `resources/js/pages/`
- Wayfinder generates typed route definitions (`resources/js/wayfinder/`); form variants enabled
- React Compiler enabled via `babel-plugin-react-compiler`
- Reverb broadcasting via `@laravel/echo-react`
- ESLint enforces import ordering, consistent type imports, brace style `1tbs`, padding around control statements
- ESLint ignores: `actions/`, `components/ui/`, `routes/`, `wayfinder/` (generated)
- Prettier tailwind functions: `clsx`, `cn`, `cva`
- Inertia SSR enabled (default port 13714)

## Tooling notes

- `opencode.json` enables `laravel-boost` MCP (run `php artisan boost:mcp`)
- `boost.json` confirms MCP on, Nightwatch off, Sail off, cloud off
- EditorConfig: 4-space indent, LF line endings
- `pnpm-workspace.yaml` exists but CI uses `npm` — prefer npm unless adding deps

## Architecture

Single-package Laravel app. Entrypoints:
- Backend: `bootstrap/app.php` → `routes/web.php`
- Frontend: `resources/js/app.tsx` (Inertia boot) + `resources/views/app.blade.php` (shell)
- Only one route (`/` → `welcome`) in the starter kit
