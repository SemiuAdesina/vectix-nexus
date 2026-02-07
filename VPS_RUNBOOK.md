# Vectix Foundry – VPS runbook (vectixfoundry.com)

Copy-paste these steps in order. Replace `YOUR_GITHUB_REPO_URL` with your actual repo (e.g. `https://github.com/SemiuAdesina/vectix-nexus.git`).

**VPS IP:** 187.77.1.166  
**Domain:** vectixfoundry.com (A record already points to this IP)

---

## Step 1 – Log in to the server

On your machine (terminal or Cursor terminal):

```bash
ssh root@187.77.1.166
```

When asked "Are you sure you want to continue connecting?", type `yes` and press Enter. Then enter the root password you set for the VPS.

---

## Step 2 – Install Docker, Nginx, and Certbot (foundation)

Run this single command on the server:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && apt-get update && apt-get install -y docker-compose-plugin nginx certbot python3-certbot-nginx
```

This installs: Docker Engine, Docker Compose (v2, use as `docker compose`), Nginx, and Certbot for Let’s Encrypt SSL.

---

## Step 3 – Clone the repo

Replace `YOUR_GITHUB_REPO_URL` with your real repo URL (e.g. `https://github.com/SemiuAdesina/vectix-nexus.git`). If the repo is private, use a personal access token or deploy key. The last argument is the folder name; use the same name in the next `cd` if you change it.

```bash
git clone YOUR_GITHUB_REPO_URL vectix-nexus
cd vectix-nexus
```

---

## Step 4 – Create production .env (root only)

Use **one** `.env` at the **repo root** (next to `docker-compose.yml`). Docker Compose reads it and passes variables to backend, frontend, and agent. Do not edit `backend/.env` or `frontend/.env` for Docker deploys.

Create the root env from the example:

```bash
cp .env.example .env
nano .env
```

In nano, paste your production values. Minimum to set:

- `POSTGRES_PASSWORD` – strong password for the DB
- `NEXT_PUBLIC_API_URL=` (leave **empty**; this is for the frontend—empty makes the browser use relative `/api/*` and Nginx proxies to the backend)
- `FRONTEND_URL=https://vectixfoundry.com`
- `CORS_ORIGIN=https://vectixfoundry.com,https://www.vectixfoundry.com`
- `TRUSTED_ORIGINS=https://vectixfoundry.com,https://www.vectixfoundry.com`
- `SOLANA_RPC_URL` – e.g. Helius URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SECRETS_ENCRYPTION_KEY`, `WALLET_MASTER_SECRET` (32+ chars each)
- `MOCK_FLY_DEPLOY=true`
- Stripe price IDs if you use billing

Save: `Ctrl+O`, Enter, then exit: `Ctrl+X`.

---

## Step 5 – Start the stack and run migrations

From the repo root (`vectix-nexus`):

```bash
docker compose up -d --build
```

Wait until all four containers (db, backend, frontend, agent) are up. Then run migrations:

```bash
docker compose exec backend npx prisma migrate deploy
```

Check containers:

```bash
docker compose ps
```

You should see vectix-db, vectix-backend, vectix-frontend, vectix-agent running.

---

## Step 6 – Nginx and SSL (HTTPS for vectixfoundry.com)

Copy the Nginx config and enable it:

```bash
cp deploy/nginx.vectixfoundry.conf /etc/nginx/sites-available/vectixfoundry
ln -sf /etc/nginx/sites-available/vectixfoundry /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

Obtain SSL certificates (Certbot will prompt for email and agree to terms):

```bash
certbot --nginx -d vectixfoundry.com -d www.vectixfoundry.com
```

Follow the prompts. After success, Nginx will serve HTTPS. Test:

- https://vectixfoundry.com (frontend)
- https://vectixfoundry.com/api/health (backend API)

---

## Step 7 – Optional: auto-renew SSL

Certbot usually adds a cron/systemd timer. Check:

```bash
certbot renew --dry-run
```

---

## Quick reference

| What            | Command / URL |
|-----------------|----------------|
| SSH             | `ssh root@187.77.1.166` |
| Repo root       | `cd vectix-nexus` (after clone) |
| Start stack     | `docker compose up -d --build` |
| Migrations      | `docker compose exec backend npx prisma migrate deploy` |
| Logs            | `docker compose logs -f` |
| Frontend        | https://vectixfoundry.com |
| Backend API     | https://vectixfoundry.com/api |

If you change `.env` (especially `NEXT_PUBLIC_*`), rebuild and restart:

```bash
docker compose up -d --build
```
