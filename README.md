# ReciclaMais (simple-webapp)

A small SolidJS + TypeScript web application for locating and exploring recycling collection points. This repository contains a frontend app (Vite + Solid) with mappings, collection-point data, and a small Supabase-backed configuration for development.

## Features

- SolidJS + TypeScript frontend
- Map integration (Google Maps) and clustering for collection points
- Local JSON fixtures for collection points, POIs and waste types
- Supabase integration (database types and client setup in `shared/infrastructure/supabase`)

## Quick start

Requirements

- Node.js (16+ recommended)
- pnpm (this project uses pnpm; npm or yarn may work but pnpm is preferred)

Install and run the dev server

```bash
pnpm install
pnpm dev
```

Build for production

```bash
pnpm build
pnpm preview
```

## Environment

If the app requires runtime environment variables (for example Supabase keys), add a `.env` file in the project root with the needed entries. Example variables used by this project are:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Note: The project includes a `supabase/` folder for local Supabase configuration and `src/shared/infrastructure/supabase` for client types/setup.

## Project structure (high level)

- `src/` — application sources
	- `components/` — reusable UI components (ui/)
	- `modules/collection-points/` — collection point features, map, hooks
	- `modules/auth/` — authentication state and actions
	- `routes/` — route components
	- `map/` — map-related hooks and sections
	- `shared/infrastructure/supabase/` — supabase client and types
- `public/` — static assets
- `supabase/` — local Supabase config

See the repository for more details — components and modules are organized by feature.

## Development notes

- This project follows SolidJS best practices: use `createSignal`, `createMemo`, `<For>`, `<Show>` and avoid destructuring reactive signals.
- ESLint and Prettier settings are configured for the repo — please run `pnpm run check` (if available) before opening PRs.


## License

This project is provided under the MIT License. See the `LICENSE` file for details if present.