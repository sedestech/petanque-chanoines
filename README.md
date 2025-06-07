# La Pétanque des Chanoines

This project is a React application built with Vite. Data is stored locally in
the browser using `localStorage`. Supabase is not currently used, so you can
run the app without any Supabase credentials.

## Prerequisites

- **Node.js** (version 18 or later is recommended)
- **pnpm** package manager
- Optional application password via the `VITE_ARBITRE_PASSWORD` environment
  variable

You can place this variable in a `.env` file at the project root.

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
- `pnpm run lint` – run ESLint over the project files
- `pnpm run test` – execute unit tests with Vitest

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

