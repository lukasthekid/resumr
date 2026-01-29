## resumr

Next.js fullstack app using:

- **Prisma** (PostgreSQL + migrations)
- **Auth.js (NextAuth)** (Credentials auth + Prisma adapter)

### Local development (with SSH tunnel)

1) Install deps

```bash
npm install
```

2) Create `.env` (see `.env.example` if you add one later). Required envs:

- **`DATABASE_URL`**: points to your local tunnel, e.g. `postgresql://USER:PASSWORD@127.0.0.1:5433/DB?schema=public`
- **`AUTH_URL`**: `http://localhost:3000`
- **`AUTH_SECRET`**: random secret used by Auth.js
- SSH tunnel vars: `SSH_HOST`, `SSH_PORT`, `SSH_USERNAME`, `SSH_KEY_PATH`, `DB_TUNNEL_PORT`, `DB_REMOTE_PORT`

3) Start the tunnel (keeps running)

```bash
npm run tunnel
```

4) Run Prisma migrations (Django-style “migration magic”)

```bash
npx prisma migrate dev --name init
```

5) Start Next.js

```bash
npm run dev
```

Open `http://localhost:3000`.

### Notes

- `app/page.tsx` is the landing page with login/register.
- `/app` is protected (redirects to `/` if not authenticated).
