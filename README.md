# Dropship storefront

Vite + React customer shop (catalog, cart, COD checkout).

## Local dev

```bash
npm install
npm run dev
```

Proxies `/store` to `http://localhost:4000` when `VITE_API_URL` is unset.

## Vercel

**Import:** [Deploy dropship-storefront on Vercel](https://vercel.com/new/import?s=https://github.com/Ankit-3010/dropship-storefront&framework=vite) (log in with GitHub **Ankit-3010**).

1. Deploy with defaults (Vite, `npm run build`, output `dist`).
2. **Environment variable** (required): `VITE_API_URL` = public HTTPS API (no trailing slash).  
   From the monorepo with API running: `npm run tunnel:api` → copy `PUBLIC_API_URL` into Vercel.
3. In the API `.env`, set `PUBLIC_STORE_URL` to your Vercel URL and restart `npm run dev:api`.

**CLI** (after `vercel login`):

```bash
vercel link
vercel env add VITE_API_URL production   # paste tunnel or production API URL
vercel --prod
```

**GitHub Actions** (optional): add repo secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VITE_API_URL` — see `.github/workflows/vercel-production.yml`.
