# Dropship storefront

Vite + React customer shop (catalog, cart, COD checkout).

## Local dev

```bash
npm install
npm run dev
```

Proxies `/store` to `http://localhost:4000` when `VITE_API_URL` is unset.

## Vercel

1. Import this repo in [Vercel](https://vercel.com/new).
2. Set **Environment variable**: `VITE_API_URL` = your public API URL (HTTPS).
3. On the API server, set `PUBLIC_STORE_URL` to your Vercel URL (e.g. `https://your-app.vercel.app`) so CORS and WhatsApp shop links work.

Build: `npm run build` · Output: `dist`
