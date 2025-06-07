# La Pétanque des Chanoines

This project is a React application built with Vite. Data is persisted using
[Supabase](https://supabase.com/), allowing all users to share the same state.
Provide your Supabase credentials via environment variables in order to run the
application.

## Prerequisites

- **Node.js** (version 18 or later is recommended)
- **pnpm** package manager
- Optional application password via the `VITE_ARBITRE_PASSWORD` environment
  variable
- Supabase credentials via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

You can place these variables in a `.env` file at the project root.
The Supabase URL must be a full URL starting with `https://`, for example
`https://<project>.supabase.co`.

Create the following tables in Supabase instead of the previous `petanque_data`
JSON store. Each table uses a simple primary key column named `id`:

- **joueurs** – `id` (text primary key), `pseudo` (text), `paye` (boolean),
  `arbitre` (boolean)
- **equipes** – `id` (text primary key), `nom` (text), `joueurs` (jsonb),
  `victoires` (integer), `points` (integer), `partiesJouees` (integer)
- **concours** – `id` (text primary key), `nom` (text), `date` (text),
  `statut` (text), `nombreParties` (integer), `dureePartie` (integer),
  `partieActuelle` (integer)
- **parties** – `id` (text primary key), `numero` (integer), `equipe1` (jsonb),
  `equipe2` (jsonb), `score1` (integer), `score2` (integer), `statut` (text),
  `heureDebut` (text), `heureFin` (text)
- **archives** – `id` (text primary key), `nom` (text), `date` (text),
  `classementFinal` (jsonb)

### Supabase setup

If you are starting from scratch, run the following SQL commands in the
Supabase SQL editor to create the table and insert initial data:

```sql
CREATE TABLE joueurs (
  id text PRIMARY KEY,
  pseudo text,
  paye boolean,
  arbitre boolean
);

CREATE TABLE equipes (
  id text PRIMARY KEY,
  nom text,
  joueurs jsonb,
  victoires integer,
  points integer,
  partiesJouees integer
);

CREATE TABLE concours (
  id text PRIMARY KEY,
  nom text,
  date text,
  statut text,
  nombreParties integer,
  dureePartie integer,
  partieActuelle integer
);

CREATE TABLE parties (
  id text PRIMARY KEY,
  numero integer,
  equipe1 jsonb,
  equipe2 jsonb,
  score1 integer,
  score2 integer,
  statut text,
  heureDebut text,
  heureFin text
);

CREATE TABLE archives (
  id text PRIMARY KEY,
  nom text,
  date text,
  classementFinal jsonb
);
```

Provide the project with your Supabase credentials via environment variables in
a `.env` file:

```
VITE_SUPABASE_URL=<your Supabase URL>
VITE_SUPABASE_ANON_KEY=<your anonymous key>
```

If the URL or key is incorrect, the application will display an "Invalid URL"
error in the browser.


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

