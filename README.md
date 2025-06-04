# La Pétanque des Chanoines

This project is a React application that uses Vite and Supabase.

## Prerequisites

- **Node.js** (version 18 or later is recommended)
- **pnpm** package manager
- Application credentials via the following environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_ARBITRE_PASSWORD`

You can place these variables in a `.env` file at the project root.

## Setup

Install dependencies and start the development server:

```bash
pnpm install
pnpm run dev
```

## Available Scripts

The `package.json` defines a few scripts that can be run with pnpm:

- `pnpm run dev` – start the Vite development server
- `pnpm run build` – create a production build in the `dist` directory
- `pnpm run preview` – serve the production build locally

