# SAATHI — AI voice agent prototype (frontend)

React + Vite dashboard for **Saathi**: leads, RM views, analytics, and **Voice Monitor** (WebSocket to the API).

The **FastAPI backend** is a **separate repository**: **[saathi-prototype-backend](https://github.com/pawannitt-26/saathi-prototype-backend)** — deploy or run that service and point this app at it.

## Quick start

1. **API** — Clone [saathi-prototype-backend](https://github.com/pawannitt-26/saathi-prototype-backend), add `.env` from its `.env.example`, then either:
   - `docker compose up --build`, or  
   - local: `uvicorn` (see that repo’s README).
2. **Frontend** — Copy [.env.example](.env.example) to `.env` or `.env.local` and set:
   - `VITE_API_URL` — base URL of the API (e.g. `http://localhost:8000` or your hosted URL)
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for sign-in
3. `npm install && npm run dev`
4. Create an RM user in Supabase Auth (**Authentication → Users**) and sign in.

## Voice session

Open **Voice Monitor**, pick a lead, **Start session**. The server streams AI tokens and optional TTS when Sarvam is configured on the API. **End & score** persists transcript and RM handoff data.

Vendor keys stay on the **API** only; this SPA uses `VITE_API_URL` — no LLM/STT secrets in the browser.

## Authentication

- Sign-in: Supabase email/password (`src/utils/supabase.ts`).
- API calls send `Authorization: Bearer` from the Supabase session (`src/api/client.ts`).
- WebSocket `/ws/call` sends `access_token` in the query string.

## Supabase

Use the **same** Supabase project for the browser client **and** for the API’s `DATABASE_URL` / JWT verification so RMs, leads, and calls stay consistent. Configure **RLS** for any tables the anon key should access from the SPA.

For Postgres connection strings (pooler vs direct), see the **backend** repo README.
