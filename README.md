# Next.js Starter Kit

A production-minded Next.js boilerplate for landing pages, portfolios, dashboards, backoffices, games, blogs, and product apps.

Demo: <https://dev-nextjs-starter-kit.vercel.app/>

## Stack

- Next.js App Router
- React
- TypeScript strict mode
- Tailwind CSS v4
- shadcn/ui with the full official component set
- ESLint
- Prettier with Tailwind class sorting
- Vitest, React Testing Library, and jsdom
- Zod-based environment validation
- GitHub Actions CI

## Getting Started

```bash
git clone https://github.com/devinaacs/next-starter-kit.git my-app
cd my-app
cp .env.example .env.local
npm install
npm run dev
```

Open <http://localhost:3000>.

## Scripts

```bash
npm run dev            # Start local development
npm run build          # Create a production build
npm run start          # Start the production server
npm run lint           # Run ESLint
npm run typecheck      # Run TypeScript without emitting files
npm run format         # Format the project
npm run format:check   # Check formatting
npm run test           # Run unit and component tests
npm run test:watch     # Run tests in watch mode
npm run check          # Run the full local quality gate
```

## Project Structure

```txt
src/
  app/                 App Router routes, layout, and route fallbacks
  components/
    layout/            Reusable page shell components
    shared/            Shared providers and cross-app components
    ui/                shadcn/ui component source
  config/              Site and app-level configuration
  hooks/               Shared React hooks
  lib/                 Utilities and environment validation
  test/                Test setup files
  types/               Shared TypeScript types
```

## Environment

Create a local environment file from the example when a project needs local values:

```bash
cp .env.example .env.local
```

The example file starts with:

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Environment values are validated in `src/lib/env.ts`. Keep public browser-safe values prefixed with `NEXT_PUBLIC_`.

## UI Components

The full shadcn/ui component set is installed under `src/components/ui`. These are source files owned by the project, so you can edit them to fit the app instead of treating them as a locked dependency.

The app shell wraps routes with:

- `next-themes`
- shadcn `TooltipProvider`
- shadcn/Sonner `Toaster`

## Conventions

- Use Node.js 22. The repo includes `.nvmrc` for Node version managers.
- Use `@/` imports for files inside `src`.
- Keep generic reusable UI in `src/components/ui`, layout shell pieces in `src/components/layout`, and app-specific shared pieces in `src/components/shared`.
- Keep validated configuration in `src/config` and `src/lib/env.ts`.
- Run `npm run check` before merging or deploying.

## CI

GitHub Actions runs `npm ci` and `npm run check` on pushes to `main` and pull requests.

## Deployment

The starter is compatible with Vercel and any Node-compatible hosting that supports Next.js.

Deploy to Vercel from the project root:

```bash
npm run build
npx vercel@latest deploy
```

For a production deployment, run:

```bash
npx vercel@latest deploy --prod
```

On the first deploy, the Vercel CLI will ask you to create or link a Vercel project. After deployment, set `NEXT_PUBLIC_APP_URL` to the deployed origin for correct metadata URLs:

```bash
npx vercel@latest env add NEXT_PUBLIC_APP_URL production
```

Then redeploy production so the new environment value is included.
