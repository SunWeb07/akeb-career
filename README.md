# Local Supabase Setup (Recommended for Development)

To run Supabase locally (uses fewer resources and is private):

1. **Install [Docker](https://www.docker.com/get-started/)** (required for local Supabase).
2. **Install the [Supabase CLI](https://supabase.com/docs/guides/cli/installation):**

	```bash
	npm install -g supabase
	# or
	brew install supabase/tap/supabase-cli
	```

3. **Start Supabase locally:**

	```bash
	supabase init
	supabase start
	```

	This will print your local Supabase URL and anon key. Example:
	- URL: http://localhost:54321
	- anon key: (see CLI output)

4. **Update your `.env.local` file:**

	```env
	NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
	NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
	```

5. **Continue with the rest of the setup steps above.**

---

# Local Setup & Environment Variables

To run this application locally, follow these steps:

## 1. Clone the repository

```bash
git clone <repo-url>
cd akeb-career
```

## 2. Install dependencies

```bash
npm install
# or
yarn install
```

## 3. Set up environment variables

- Copy `.env.example` to `.env.local` in the root directory:

	```bash
	cp .env.example .env.local
	```
- Fill in the required values for Supabase and PostgreSQL in `.env.local`.

## 4. Run database migrations (if needed)

```bash
npx prisma migrate dev
```

## 5. (Optional) Seed the database

```bash
npm run db:seed
```

## 6. Start the development server

```bash
npm run dev
```

## 7. Open the app

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Default Dev Credentials

The following users are seeded for local development (see `prisma/seed.ts`):

- admin@akeb.dev / devpass123
- counsellor@akeb.dev / devpass123
- institution@akeb.dev / devpass123
- student@akeb.dev / devpass123

---

## Environment Variables Reference

See `.env.example` for all required environment variables and descriptions.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
