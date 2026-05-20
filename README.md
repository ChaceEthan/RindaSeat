# RindaSeat

RindaSeat is a production-oriented transport reservation platform for Rwanda. The monorepo contains:

- `backend`: Express, PostgreSQL, Socket.IO, Firebase Admin, QR tickets, payments, auth, dashboards API.
- `frontend`: Vite React app for passengers, booking, payments, tickets, dashboard, and admin views.

Production targets:

- Backend API: `https://rindaseat.onrender.com`
- Backend API base path: `https://rindaseat.onrender.com/api`
- Frontend: Vercel project URL, typically `https://rindaseat.vercel.app` when the project alias is configured.

## Local Setup

Install dependencies in each app:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create local env files from examples:

```bash
cd backend
cp .env.example .env

cd ../frontend
cp .env.example .env
```

For local development, set:

```bash
# backend/.env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/rindaseat
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000

# frontend/.env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start both apps:

```bash
cd backend
npm run dev

cd ../frontend
npm run dev
```

## Backend Commands

Run from `backend/`:

```bash
npm install
npm run db:setup
npm run dev
npm start
npm run verify
```

Important endpoints:

```text
GET /
GET /favicon.ico
GET /health
GET /api/health
GET /api/trips/search
POST /api/auth/signup
POST /api/auth/login
POST /api/bookings
POST /api/payments/initiate
GET /api/tickets/:id
```

`GET /` returns the production API identity payload. `GET /favicon.ico` returns `204`. `GET /api/health` returns server, database, environment, Firebase, and timestamp status.

## Frontend Commands

Run from `frontend/`:

```bash
npm install
npm run dev
npm run build
npm run preview
```

Production builds use:

```bash
VITE_API_URL=https://rindaseat.onrender.com/api
VITE_SOCKET_URL=https://rindaseat.onrender.com
```

If these are not set during a production build, the frontend code defaults to the same Render URLs. Development defaults to `http://localhost:5000`.

## PostgreSQL Setup

Required backend variable:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

Local setup:

```bash
cd backend
npm run db:setup
```

Production setup on Render:

1. Create a Render PostgreSQL database.
2. Copy the internal or external connection string into the backend service as `DATABASE_URL`.
3. Keep `NODE_ENV=production`.
4. Leave `DATABASE_SSL` empty unless a provider-specific override is needed.
5. Set `DATABASE_SSL_REJECT_UNAUTHORIZED=false` for managed PostgreSQL providers that require SSL without local CA trust.

The backend uses `process.env.DATABASE_URL` for PostgreSQL and enables SSL automatically in production/Render with `rejectUnauthorized: false` by default.

## Render Backend Deployment

Create a Render Web Service:

- Root directory: `backend`
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

Required environment variables:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=...
CLIENT_URL=https://rindaseat.vercel.app
FRONTEND_URL=https://rindaseat.vercel.app
CORS_ORIGINS=https://rindaseat.vercel.app
SOCKET_CORS_ORIGIN=https://rindaseat.vercel.app
DEFAULT_CURRENCY=RWF
```

Render provides `PORT`; do not set it manually unless Render asks you to. The backend exits in production if `PORT`, `DATABASE_URL`, or `JWT_SECRET` are missing, rather than falling back to localhost.

Optional Render variables:

```bash
ALLOW_VERCEL_PREVIEW_ORIGINS=true
ENABLE_REQUEST_LOGGING=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DB_POOL_MAX=20
DB_CONNECTION_TIMEOUT_MS=5000
```

Use `ALLOW_VERCEL_PREVIEW_ORIGINS=true` only when Vercel preview deployments must call the production backend.

## Vercel Frontend Deployment

Create a Vercel project:

- Root directory: `frontend`
- Framework preset: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

Production environment variables:

```bash
VITE_API_URL=https://rindaseat.onrender.com/api
VITE_SOCKET_URL=https://rindaseat.onrender.com
```

After deployment, update the Render backend CORS variables with the final Vercel production URL:

```bash
CLIENT_URL=https://your-vercel-domain
FRONTEND_URL=https://your-vercel-domain
CORS_ORIGINS=https://your-vercel-domain
SOCKET_CORS_ORIGIN=https://your-vercel-domain
```

## Firebase Setup

Firebase Admin is optional for degraded local mode but should be configured in production for push/auth readiness.

Preferred Render variables:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FCM_SERVER_KEY=...
```

Alternative:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON={"project_id":"...","client_email":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"}
```

Keep the private key as a single environment variable with escaped `\n` newlines. The backend normalizes escaped newlines before initializing Firebase Admin. Missing Firebase variables do not crash the server; health reports Firebase as degraded until configured.

## Stripe Setup

Backend variables:

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Webhook endpoint:

```text
POST https://rindaseat.onrender.com/api/payments/webhooks/stripe
```

The Express raw body parser is isolated to the Stripe webhook route so normal JSON APIs keep working.

## MTN MoMo Setup

Backend variables:

```bash
MTN_MOMO_API_USER=...
MTN_MOMO_API_KEY=...
MTN_MOMO_API_SECRET=...
MTN_MOMO_SUBSCRIPTION_KEY=...
MTN_MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_MOMO_TARGET_ENV=sandbox
```

For production, use MTN production credentials and set:

```bash
MTN_MOMO_TARGET_ENV=production
```

The current booking flow keeps demo payment confirmation intact while checking that the selected payment provider is configured before accepting live-like payment methods.

## Production Environment Reference

Backend required:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

Backend recommended:

```bash
APP_NAME=RindaSeat
APP_VERSION=1.0.0
CLIENT_URL=https://rindaseat.vercel.app
FRONTEND_URL=https://rindaseat.vercel.app
CORS_ORIGINS=https://rindaseat.vercel.app
SOCKET_CORS_ORIGIN=https://rindaseat.vercel.app
DEFAULT_CURRENCY=RWF
BCRYPT_SALT_ROUNDS=10
QR_CODE_EXPIRATION_MINUTES=30
SEAT_LOCK_TIMEOUT_MINUTES=5
MAX_BOOKINGS_PER_USER=5
ENABLE_REQUEST_LOGGING=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Frontend required on Vercel:

```bash
VITE_API_URL=https://rindaseat.onrender.com/api
VITE_SOCKET_URL=https://rindaseat.onrender.com
```

Never commit `.env` files. The repository ignores `.env`, `.env.*`, `node_modules`, build output, and logs.

## Security Notes

The backend enables:

- Helmet security headers.
- CORS allowlisting for production origins.
- Socket.IO CORS allowlisting.
- Rate limiting under `/api`.
- Request body size limits.
- Request payload sanitization for null bytes and prototype pollution keys.
- Production-safe error responses.
- Secret masking in environment reports.

Do not log raw `DATABASE_URL`, JWT secrets, Firebase private keys, Stripe secrets, MoMo secrets, SMTP passwords, or SMS keys.

## Troubleshooting

Backend tries `localhost:5432` in production:

- Confirm Render has `DATABASE_URL` set.
- Confirm `NODE_ENV=production`.
- Redeploy after env changes.
- Check `/api/health`; database should be `connected`.

Firebase private key warning:

- Store the key in one variable.
- Use escaped newlines: `\n`.
- Keep the `BEGIN PRIVATE KEY` and `END PRIVATE KEY` markers.
- Do not paste a multiline JSON fragment into `.env`.

Frontend calls localhost after Vercel deploy:

- Set `VITE_API_URL=https://rindaseat.onrender.com/api`.
- Set `VITE_SOCKET_URL=https://rindaseat.onrender.com`.
- Redeploy; Vite embeds env variables at build time.

CORS failures:

- Put the final Vercel URL in `CLIENT_URL`, `FRONTEND_URL`, `CORS_ORIGINS`, and `SOCKET_CORS_ORIGIN` on Render.
- If testing preview deployments, set `ALLOW_VERCEL_PREVIEW_ORIGINS=true`.

Render service starts but health is degraded:

- Verify PostgreSQL tables exist by running the schema and seed scripts against the production database.
- Check `DATABASE_URL` points to the deployed database, not a local database.
- Confirm SSL is enabled by leaving `DATABASE_SSL` empty or setting it to `true`.

Blank frontend page:

- Run `npm run build` in `frontend/`.
- Confirm Vercel output directory is `dist`.
- Check browser console for failed API or CORS requests.

## Deployment Verification Checklist

Backend:

- `GET https://rindaseat.onrender.com/` returns the API identity payload.
- `GET https://rindaseat.onrender.com/favicon.ico` returns `204`.
- `GET https://rindaseat.onrender.com/api/health` returns `server: running`.
- Startup log includes `Connected successfully to production database`.
- Startup log includes `[FIREBASE] Initialized successfully` when Firebase env is configured.

Frontend:

- Home, auth, trip search, booking, payment, tickets, dashboard, and admin routes render.
- Production API requests go to `https://rindaseat.onrender.com/api`.
- Production socket URL is `https://rindaseat.onrender.com`.
- No production bundle references `localhost:5000`.
