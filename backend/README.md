# RindaSeat Backend

Production-ready Node.js, Express, and PostgreSQL API for the RindaSeat Smart Transport System. The backend supports passenger authentication, trip discovery, seat booking, QR tickets, payment orchestration, real-time Socket.IO updates, and optional email, SMS, Firebase, Stripe, and MTN MoMo integrations.

## Tech Stack

- Node.js and Express
- PostgreSQL with `pg`
- JWT authentication and bcrypt password hashing
- Socket.IO for real-time updates
- QR ticket generation
- Stripe and MTN MoMo payment hooks
- Firebase Admin SDK for push/auth support
- Nodemailer SMTP email notifications
- Optional HTTP SMS gateway
- Helmet, CORS, rate limiting, and security middleware

## Project Structure

```text
backend/
  database/
    schema.sql
    seed.sql
  scripts/
    lint-check.js
    setup-db.js
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
    app.js
    server.js
```

## Setup

```bash
cd backend
npm install
```

Create `backend/.env` from `.env.example` and fill only real values for your local or production environment.

Minimum required values:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/rindaseat
JWT_SECRET=replace-with-a-strong-secret
PORT=5000
NODE_ENV=development
```

Never commit `.env`, service account JSON files, Stripe local files, logs, or generated uploads.

## Database

The Windows-safe setup script uses Node and `pg`; no manual `psql` command is required.

```bash
npm run db:setup
npm run db:check
```

The setup script:

- creates the `rindaseat` database if it is missing
- runs `database/schema.sql`
- runs `database/seed.sql`
- detects common PostgreSQL Windows install paths

## Development

```bash
npm run dev
```

The API defaults to:

```text
http://localhost:5000
```

Useful checks:

```bash
npm run lint:check
npm run health
npm run db:check
```

## API Overview

```text
GET  /health
GET  /api/health

GET  /api/auth
POST /api/auth/register
POST /api/auth/login

GET  /api/trips

GET  /api/bookings
POST /api/bookings

GET  /api/companies

GET  /api/payments
POST /api/payments
POST /api/payments/webhooks/stripe
POST /api/payments/webhooks/momo
```

Protected routes require a `Bearer` JWT token in the `Authorization` header.

## Notifications

Booking confirmation notifications are non-blocking. Missing SMTP, SMS, or Firebase configuration will not crash the backend.

Optional notification environment variables:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@rindaseat.rw

SMS_API_KEY=
SMS_SENDER_ID=RindaSeat
SMS_API_URL=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Payments

Stripe and MTN MoMo keys are optional for local startup. If a payment provider is not configured, payment endpoints return a safe provider-not-configured response instead of crashing.

Stripe webhooks use a raw JSON parser only on the webhook route:

```text
POST /api/payments/webhooks/stripe
```

## Production Notes

Before deployment:

```bash
npm install
npm audit
npm run lint:check
npm run health
npm run db:check
```

Recommended production settings:

- use a managed PostgreSQL instance with SSL enabled when required
- set a strong `JWT_SECRET`
- configure real Stripe and MTN MoMo credentials
- configure Firebase service account values using escaped newline private keys
- configure SMTP/SMS only when notifications should be delivered
- run behind HTTPS
- keep `.env` and credential JSON files out of Git

## Git Safety

The repository ignores local secrets, dependencies, logs, uploads, build output, IDE files, and credential files. Review changes before committing:

```bash
git status --short
git diff -- .gitignore package.json README.md src scripts
```
