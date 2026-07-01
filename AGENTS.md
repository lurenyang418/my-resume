# MyResume — AGENTS.md

## Quick start

```bash
pnpm install            # pnpm 10.3.0 required
pnpm dev                # Vite dev (frontend + API), http://localhost:5173
pnpm build              # vite build → dist/client + dist/cv
pnpm preview            # vite preview, http://localhost:4173
pnpm deploy             # build + wrangler deploy
```

## Architecture

- **Vite 8 + React 19 SPA** frontend with **Workers + Assets** for unified deployment.
- **Client-side routing** via `react-router-dom` (BrowserRouter). Routes defined in `src/App.tsx`.
- **i18n** — custom `I18nProvider`. Messages in `src/i18n/locales/{zh,en}.json`. Locale persisted in localStorage key `my-resume-locale`.
- **State** managed with Zustand 5 stores in `src/store/`.
- **UI** is shadcn/ui (New York style) built on Radix primitives. Components in `src/components/ui/`, aliased as `@/components/ui`.
- **Rich text** uses Tiptap 3 editor. Styles live in `src/styles/tiptap.scss`.
- **Theme** — custom `ThemeStateProvider`, class-based dark mode, storage key `my-resume-theme`.
- **Styling** — Tailwind CSS 4 via `@tailwindcss/vite`. Config is in `src/globals.css`.
- **Animation** — framer-motion 12. Accordion animations defined in `globals.css` keyframes.
- **API** — Hono worker at `src/worker/index.ts` (3 routes: `/api/grammar`, `/api/polish`, `/api/proxy/image`). Compiled by `@cloudflare/vite-plugin` during `vite build`.

## Deployment

Single command deploys frontend + API together as a Workers + Assets project:
```bash
pnpm deploy  # pnpm build && wrangler deploy
```

Deploys to Cloudflare Workers (not Pages). The `@cloudflare/vite-plugin` compiles the worker into `dist/cv/` and the frontend into `dist/client/`. Wrangler automatically detects the plugin output and uses `dist/cv/wrangler.json`.

## Development

```bash
pnpm dev  # @cloudflare/vite-plugin runs worker + Vite together on localhost:5173
```

## Storage

Resume data persists in the browser via two mechanisms:
- **Zustand `persist` middleware** → `localStorage` (`resume-storage` & `ai-config-storage` keys) for all resume/state data.
- **File System Access API** (`src/utils/fileSystem.ts`) → optional directory handle in IndexedDB for syncing `.json` files to the local filesystem.

## TypeScript

- Path alias `@/*` → `./src/*`.
- `strict: true` in tsconfig.
- `src/worker/` is excluded from frontend tsconfig (compiled by esbuild via wrangler).
- No tests and no CI workflows.
