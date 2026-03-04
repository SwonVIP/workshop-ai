# Workshop AI — Frontend

Angular 21 single-page application for the e-commerce workshop scaffold.

## Prerequisites

- Node.js 22+
- npm 10+
- Backend running on port 9000 (for API proxy and E2E tests)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (proxies /api to localhost:9000)
npx ng serve

# Open http://localhost:4200
```

## Testing

```bash
# Unit tests (Vitest via Angular builder — handles path aliases)
npx ng test --no-watch

# E2E tests (Playwright — requires backend on port 9000)
npx playwright test

# E2E with visible browser
npx playwright test --headed

# Lint
npx ng lint
```

> **Important**: Always use `npx ng test` (not `npx vitest`) — the Angular builder resolves `@spartan-ng/helm/*` path aliases from `tsconfig.json`.

### Test Counts

| Suite | Count |
|-------|-------|
| Unit tests (Vitest) | 174 |
| E2E tests (Playwright) | 43 |
| **Total** | **217** |

## UI Stack

- **Spartan UI** — accessible component primitives (Sheet, Button, Badge, Card, Skeleton, etc.)
- **Tailwind CSS 3** — utility-first styling with semantic design tokens
- **Dark mode** — system preference detection + manual toggle (light/dark/system), persisted in localStorage

## Architecture

```
src/app/
├── core/
│   ├── models/          # TypeScript interfaces (Product, Cart, etc.)
│   └── services/        # ProductService, CartService, ThemeService
├── features/
│   ├── catalog/         # Product grid, search/filter bar, product card
│   ├── cart/            # Cart page, item row, order summary
│   └── checkout/        # Placeholder for workshop participants
├── shared/
│   └── components/      # Header (with cart drawer), Footer, Pagination, EmptyState, ThemeToggle
└── app.ts               # Root component with layout

e2e/                     # Playwright E2E tests
libs/ui/                 # Spartan UI helm components (generated, local ownership)
```

## Key Patterns

- **Signal-based**: `input()`, `output()`, `computed()`, `effect()`, `signal()`, `linkedSignal()`
- **Control flow**: `@if`, `@for`, `@switch` (no `*ngIf`/`*ngFor`)
- **`httpResource()`** for declarative data fetching with loading/error states
- **Standalone components** (Angular 21 default — no `standalone: true` needed)
- **Spartan Sheet** for cart drawer (requires `<ng-template hlmSheetPortal>` pattern)
- **Design tokens**: all colors use semantic HSL variables (`bg-background`, `text-foreground`, `border-border`, etc.) — fully dark-mode compatible

## Proxy Configuration

API calls are proxied to the backend via `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:9000",
    "secure": false
  }
}
```

## Environment

The app uses `src/environments/environment.ts` for configuration:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: '/api',
};
```
