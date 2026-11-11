# Brawl Mod Manager cloud API

This Worker is deployed to Cloudflare by **GitHub Actions**. It runs in the cloud and does not require the Mac to be awake, installed, or running a local server. GitHub Pages itself is static hosting; the Worker is the separate API service.

## What is live in this version

- `GET /api/health`: reports service status and the actual enabled capabilities.
- `GET /api/catalog`: returns the committed, read-only mod catalog.
- CORS is restricted to the project's GitHub Pages origin. Requests without an Origin header are accepted for Wii-side clients.
- The API rejects writes and unknown routes. It does not accept arbitrary uploads or execute downloaded files.

## One-time GitHub setup

Open the repository's **Settings → Secrets and variables → Actions → New repository secret** and add:

- `CLOUDFLARE_API_TOKEN`: a Cloudflare API token with permission to edit Workers Scripts for the intended account.
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID.

Do not commit either value, put them in GitHub Pages, or send them in chat.

After those two secrets are saved, every push to `main` that changes `cloud/worker/**` or the deploy workflow will run tests and deploy the Worker. You can also run **Actions → Deploy Brawl Mod Cloud → Run workflow**. The workflow checks for missing secrets and reports a clear setup error.

## Find the deployed API URL

Open **Actions → Deploy Brawl Mod Cloud**, select the successful run, and open its deploy log. Wrangler prints the deployed `.workers.dev` URL. The URL normally looks like:

`https://brawl-mod-manager-api.<your-workers-subdomain>.workers.dev`

## Not implemented yet

This deployment is a working cloud health/catalog API, not the full MEGA mod pipeline. MEGA account authorization, private session storage, downloading and safely extracting permitted archives, uploading to MEGA, and Wii/RiiFS file delivery still need separate implementations and end-to-end testing. Existing REX files on the Wii are not changed by this API.

GitHub cannot silently create Cloudflare credentials or grant itself account access. The two repository secrets are a one-time authorization step; after that, deployment is driven by GitHub.
