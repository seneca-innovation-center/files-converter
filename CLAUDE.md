# CLAUDE.md

Project: files-converter
Stack: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Zustand

## GENERAL

- Use the Next.js App Router (`app/` directory) for all routes.
- Keep components focused: one component per file, one concern per component.
- Use kebab-case for filenames where possible; PascalCase for component files.

## PROJECT LAYOUT

```
app/              — Next.js App Router pages and layouts
components/       — React components
  ui/             — shadcn/ui primitives (do not edit manually; use shadcn CLI)
  auth/           — Authentication components
state/            — Zustand stores (one per feature)
lib/              — Utilities and API client
  api/            — Axios client and API types
  auth/           — Better Auth client setup
hooks/            — Custom React hooks
providers/        — React context providers
types/            — Shared TypeScript types
public/           — Static assets
```

## COMPONENTS

- All page-level components must be `"use client"` since they use hooks and browser APIs.
- Use shadcn/ui components from `components/ui/` for all UI primitives.
- Do not import from `@radix-ui` directly; use the shadcn wrappers.
- Feature converters follow the pattern: `<Feature>Converter.tsx` in `components/`.

## STATE MANAGEMENT

- Use Zustand with Immer for all stores in `state/`.
- Store naming: `use<Feature>Store.ts` (e.g., `useImagesStore.ts`).
- Each store owns its own API calls and progress tracking.
- Never access stores outside React components or other stores.

## API CLIENT

- All API calls go through the Axios instance in `lib/api/client.ts`.
- The client automatically attaches Bearer tokens from the auth store.
- Timeout is 5 minutes (large file uploads).
- API types are defined in `lib/api/types.ts`.

## STYLING

- Use Tailwind CSS v4 utility classes for all styling.
- Use `cn()` from `lib/utils.ts` for conditional class merging.
- Do not use CSS modules or inline styles; stick to Tailwind.
- Prettier plugin `prettier-plugin-tailwindcss` auto-sorts classes.

## AUTH

- Authentication uses Better Auth via `lib/auth/client.ts`.
- Auth state is managed in `state/useAuthStore.ts`.
- Auth UI components live in `components/auth/`.

## ERROR HANDLING

- Do not use `console.*` in source code. Errors should be shown to users via `sonner` toasts.
- In catch blocks, show a user-facing toast and silently ignore the error, or re-throw for the caller.

## FORMS AND VALIDATION

- Use React Hook Form + Zod for form handling and validation.
- Define Zod schemas alongside the component or in `types/`.

## ENVIRONMENT

- Environment variables are in `.env.local` (not committed).
- Public env vars must be prefixed with `NEXT_PUBLIC_`.
- `.env.example` documents all required variables.

## RUNTIME

- Use Bun as the package manager and runtime.
- Use `bun install`, `bun run dev`, `bun run build`, etc.

## SCRIPTS

- `bun run dev` — Development server
- `bun run build` — Production build
- `bun run lint` — ESLint check
- `bun run lint:fix` — ESLint auto-fix
- `bun run knip` — Detect unused code

## WHAT NOT TO CHANGE

- `components/ui/` — These are shadcn/ui generated; modify via shadcn CLI only.
- `next.config.ts` — Only change if adding new webpack loaders.
- ESLint and Prettier configs — Keep consistent with existing setup.
