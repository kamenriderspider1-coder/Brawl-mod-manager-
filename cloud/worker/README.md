# Brawl Mod Manager cloud API

Live endpoint: **https://brawl-mod-manager-api.brawlmodmanager.workers.dev**

The Worker is hosted on Cloudflare and does not require the Mac to be awake, installed, or running a local server. GitHub Pages hosts the website; this Worker is the separate API service.

## What is live

- `GET /api/health`: reports service status and the actual enabled capabilities.
- `GET /api/catalog`: returns the committed, read-only catalog.
- CORS is restricted to `https://kamenriderspider1-coder.github.io`.
- Requests without an Origin header can read the catalog for future Wii-side clients.
- Writes and unknown routes are rejected.

## MEGA connection status

The website now has a browser-side MEGA connection panel based on the community-maintained, unofficial `megajs` package. It can attempt a direct MEGA sign-in, create/find a `Brawl Mods` folder, list that folder, and upload files the user explicitly selects (up to 50 MB per file in this initial browser workflow).

Important boundaries:
- The MEGA login is performed by the browser library directly against MEGA. The password is not sent to this Cloudflare Worker and is not saved by the page; the input is cleared after the login attempt.
- The live browser session exists only in page memory and ends when disconnected or when the page is closed.
- The library is unofficial, so this is an experimental first connection, not an official MEGA integration. The user must test it with their own MEGA account.
- Automatic source-page crawling, downloading arbitrary mod URLs, archive extraction, background jobs, and Wii/RiiFS file delivery are not implemented.
- No existing Smash REX files on the Wii are changed.

## Deploying updates

The repository includes a GitHub Actions workflow at `.github/workflows/deploy-cloud.yml`. To let GitHub Actions deploy future Worker source changes automatically, add these repository Actions secrets:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Workers Scripts Edit permission.
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID.

Do not commit either value, put them in GitHub Pages, or send them in chat. The currently live Worker was deployed through the authorized Cloudflare connection. The workflow will fail its credential check until the two GitHub secrets are added.

## API routes

- `GET /api/health`
- `GET /api/catalog`

The API currently exposes no MEGA credentials, session data, or file upload routes.
