# marketplace-core

NestJS backend for a multi-vendor marketplace, with Prisma ORM and PostgreSQL.

## Tech Stack

- NestJS
- Prisma 7
- PostgreSQL
- Redis + BullMQ (module structure in place)

## Prerequisites

- Node.js 18+ (recommended)
- npm
- Local PostgreSQL running on `localhost:5432`

## Environment Setup

1. Copy env file:

```bash
cp .env.example .env
```

2. Set local database URL in `.env` (adjust username/password for your machine):

```env
DATABASE_URL="postgresql://nurav@localhost:5432/multivendor_core?sslmode=disable"
```

3. Set app secrets:

```env
JWT_SECRET="replace_with_strong_secret"
PORT=3000
```

## Database Setup (Local)

This project includes helper scripts:

- `npm run db:ensure`  
  Creates the database from `DATABASE_URL` if it does not exist.
- `npm run db:migrate:deploy`  
  Applies existing migrations.
- `npm run db:generate`  
  Generates Prisma client to `src/generated/prisma`.

One-shot local setup:

```bash
npm run db:setup:local
```

Equivalent manual flow:

```bash
npm run db:ensure
npm run db:migrate:deploy
npm run db:generate
```

## Run the App

Install dependencies:

```bash
npm install
```

Run in watch mode:

```bash
npm run start:dev
```

Build:

```bash
npm run build
```

## Prisma Workflow for Future Schema Changes

When you edit `prisma/schema.prisma`:

1. Validate schema:

```bash
npm run db:validate
```

2. Create and apply migration in dev:

```bash
npm run db:migrate -- --name your_change_name
```

3. Regenerate client:

```bash
npm run db:generate
```

Useful commands:

- `npm run db:migrate:status`
- `npm run db:push` (sync without migration; use carefully)
- `npm run db:reset` (destructive)
- `npm run db:studio`

## Notes

- `DatabaseModule` exports a global `PrismaService`.
- Prisma client is generated under `src/generated/prisma`.
- If local role `postgres` does not exist, use your actual local role in `DATABASE_URL` (e.g. `nurav`).
