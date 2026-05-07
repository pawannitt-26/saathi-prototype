# SAATHI — AI voice agent prototype

Full-stack demo: **React + Vite** dashboard, **FastAPI** backend, **Supabase Postgres + Redis**, voice session over **WebSocket** (`STT → Claude → TTS` with **Sarvam / Deepgram / ElevenLabs** when keys are set).

Postgres is **not** bundled: use **Supabase** (or any Postgres you manage separately). This repo ships **Redis** in Docker Compose for the Docker workflow; hybrid dev uses **Redis on your machine** (or point `REDIS_URL` at any Redis).

## Quick start (Docker — API + Redis)

1. Copy [backend/.env.example](backend/.env.example) to `backend/.env` and set **`DATABASE_URL`** to your Supabase connection string (see **Supabase** below).
2. `docker compose up --build`
3. API: `http://localhost:8000/health`
4. Frontend: copy [.env.example](.env.example) to `.env` or `.env.local`, set `VITE_API_URL=http://localhost:8000`, then `npm install && npm run dev`
5. Create an RM user in Supabase Auth (**Authentication → Users**) and sign in from the app.

Compose overrides **`REDIS_URL`** inside the API container to `redis://redis:6379/0`; your `backend/.env` can still use `localhost` for hybrid runs and that value is ignored in Docker for Redis only.

## Local API + local Redis (no Docker for the app)

1. Run **Redis** on localhost (for example Homebrew, or `docker compose up -d redis` and use `REDIS_URL=redis://localhost:6379/0` in `backend/.env`).
2. `cd backend && python3 -m venv .venv && source .venv/bin/activate`
3. `pip install -r requirements.txt`
4. `backend/.env` with **`DATABASE_URL`** = Supabase (same as Docker path).
   - Set `SUPABASE_URL=https://<project-ref>.supabase.co`
   - Keep `SUPABASE_JWT_AUDIENCE=authenticated` unless your JWT audience is custom
   - Set `WEBHOOK_SECRET` for `/api/webhooks/*` requests
5. From `backend/`: `alembic upgrade head && python -m app.seed`
6. `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

Set `MOCK_AI=false` and provider keys when you are ready for live models.

## Tests

```bash
cd backend && PYTHONPATH=. .venv/bin/pytest tests/ -q
```

## Voice session (browser)

Open **Voice Monitor**, choose a lead, **Start session**, then type user lines. The server streams AI tokens and returns optional TTS (`audio/mpeg`) when ElevenLabs/Sarvam are configured. End with **End & score** to persist transcript, RM brief, and triggers (WhatsApp stub for **WARM**).

Vendor API keys stay on the server only. The SPA uses `VITE_API_URL` — no LLM/STT keys in the browser.

## Authentication (Supabase Auth)

- Frontend sign-in uses Supabase email/password.
- REST routes under `/api/leads`, `/api/dashboard`, `/api/analytics` require `Authorization: Bearer <access_token>`.
- WebSocket `/ws/call` requires `access_token` in the connection query string.
- `/health` stays public.
- `/api/webhooks/whatsapp/link-opened` is protected by `X-Webhook-Secret` (matches backend `WEBHOOK_SECRET`).

## Supabase (hosted Postgres + browser client)

1. **Frontend** — Add to `.env` or `.env.local` (see [.env.example](.env.example)):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`  
   Import the client from [`src/utils/supabase.ts`](src/utils/supabase.ts). The exported `supabase` is `null` until both vars are set. Use `requireSupabase()` when you need a non-null client. For `from('some_table').select()` to work, create the table in Supabase and configure **RLS** for the anon key.

2. **Backend (source of truth for leads / calls)** — Point FastAPI at the same database:
   - In Supabase: **Project Settings → Database** or **Connect**, **URI** tab.
   - If your network is **IPv4-only** and Supabase says Direct is **not IPv4 compatible**, select **Session pooler** (not Transaction pooler), then copy the URI. It usually uses a **pooler** hostname and port **5432**. Add **`?sslmode=require`** if missing.
   - If you have **IPv6** (or Supabase IPv4 add-on), **Direct connection** to `db.<project-ref>.supabase.co:5432` is fine.
   - Avoid **Transaction pooler** for `alembic upgrade` when possible (session features / migrations).
   - Set `DATABASE_URL` in `backend/.env` (use the **database password**, not the publishable/anon key). URL-encode characters like `@` and `#` in the password.
   - From `backend/`: `alembic upgrade head && python -m app.seed`
   - **Redis**: local install, or the `redis` service from this repo’s Compose, or any hosted Redis URL in `REDIS_URL`.
