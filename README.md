# Dropship storefront

Vite + React customer shop (catalog, cart, COD checkout).

## Local dev (monorepo)

From repo root:

```bash
npm run dev:store    # :5173 — proxies /store to API on :4000
npm run dev:api
```

## Demo on a phone (ngrok)

Use the **store** tunnel only — one HTTPS URL for WhatsApp and the in-app browser:

```bash
npm run tunnel:store
# restart API so PUBLIC_STORE_URL updates
npm run dev:api
```

See [docs/local-dev-whatsapp.md](../../docs/local-dev-whatsapp.md) in the monorepo.
