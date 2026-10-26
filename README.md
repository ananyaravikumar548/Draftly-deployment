# Draftly

Draftly connects job requirements to portfolio evidence, then helps shape a focused resume and recruiter email. It is a Next.js 16 application with MongoDB persistence, Groq-powered analysis, and optional Gmail OAuth.

## Requirements

- Node.js 20.9 or newer
- A reachable MongoDB database
- A Groq API key and model ID for job analysis
- Google OAuth credentials only if enabling Gmail integration

## Run locally

```bash
npm ci
cp .env.example .env.local
```

Set `MONGODB_URI`, `MONGODB_DATABASE`, `GROQ_API_KEY`, `LLM_MODEL`, and `ANALYZE_DAILY_LIMIT` in `.env.local`. `ANALYZE_DAILY_LIMIT` defaults to 10 and can be set from 10 to 15. The cap is shared across the workspace and resets at 00:00 UTC. Start MongoDB, then run:

```bash
npm run dev
```

Open `http://localhost:3000`. The app seeds fictional portfolio content into an empty workspace and preserves existing records when adding new sample data.

## Verify a release

```bash
npm run lint
npx tsc --noEmit
npm run build
npm start
```

The app requires a Node.js server runtime; static export is not supported because it uses API routes, database access, and server-rendered PDFs. The build script uses Next.js's Webpack builder for repeatable builds in restricted environments.

## Deploy

1. Deploy to a Node.js host with Node.js 20.9 or newer and configure the environment variables from `.env.example` in the host's secret manager.
2. Point `MONGODB_URI` at a persistent production MongoDB instance. Restrict network access to the app host and use a database user with only the permissions this app needs. Do not use the localhost example in a hosted environment.
3. Set `GROQ_API_KEY` and `LLM_MODEL` to enable role analysis. Keep provider credentials server-side; never prefix them with `NEXT_PUBLIC_`.
4. If enabling Gmail OAuth, configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in the host and add the exact HTTPS callback URL (`https://<your-domain>/api/gmail/callback`) to the Google OAuth client.
5. Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` before release. After deployment, verify the landing page, workspace routes, portfolio/profile APIs, resume PDF preview, and provider integrations.

## Workspace scope

The current workspace is a single shared demo profile and does not authenticate users or separate their records. Keep a public deployment limited to fictional sample data or protect it behind an access-controlled preview. Do not use it for real candidate data or Gmail tokens until authentication, per-user data isolation, and secure token storage are in place.
