# Brawl Mod Manager cloud API

Live endpoint: **https://brawl-mod-manager-api.brawlmodmanager.workers.dev**

The Worker is hosted on Cloudflare and does not require the Mac to be awake, installed, or running a local server. GitHub Pages hosts the website; this Worker is the separate API service.

## What is live

- `GET /api/health`: reports service status and the actual enabled capabilities.
- `GET /api/catalog`
- `GET /api/discover?url=...`
- `GET /api/archive?url=...`: returns the committed, read-only catalog.
- `GET /api/discover?url=<creator-page>`: scans supported HTTPS GameBanana and Project+ pages for candidate ZIP/download links (up to 20 candidates; page scan capped at 2 MB).
- `GET /api/archive?url=<detected-link>`: streams a detected archive through the Worker to the browser, capped at 100 MB.
- CORS is restricted to `https://kamenriderspider1-coder.github.io`.
- Requests without an Origin header can read the catalog for future Wii-side clients.
- Writes and unknown routes are rejected.

## MEGA connection status

The website has an experimental browser-side MEGA connection panel based on the community-maintained, unofficial `megajs` package. It can attempt direct sign-in, list folders, let the user select/create a destination, and upload explicitly selected files. A separate assisted catalog importer lets the user open a creator page, manually download a ZIP, extract it in the browser with JSZip, and upload its contents to the selected MEGA folder (100 MB ZIP, 300 MB extracted, 1,000-file limits).

Important boundaries:
- The MEGA login is performed by the browser library directly against MEGA. The password is not sent to this Cloudflare Worker and is not saved by the page; the input is cleared after the login attempt. Upload calls now pass each file's exact byte size, as required by MEGAJS v1.
- The live browser session exists only in page memory and ends when disconnected or when the page is closed.
- The library is unofficial, so this is an experimental first connection, not an official MEGA integration. The user must test it with their own MEGA account.
- The catalog importer is user-assisted: it does not crawl creator pages or automatically resolve download links. The user must obtain the archive from the creator page and select the ZIP.
- The new discovery flow scans only the allowlisted GameBanana and Project+ hostnames. Redirects outside those hosts are rejected. It does not crawl unrelated domains, bypass logins/paywalls, or guarantee that every creator page exposes a detectable direct archive link.
- The archive proxy streams supported downloads to the browser with a 100 MB cap. The browser still validates/extracts ZIPs and uploads their contents through the active experimental MEGAJS session. No server-side MEGA account access or background job is implemented.
- RAR/7z support, background jobs, and Wii/RiiFS file delivery are not implemented.
- The browser importer is experimental and memory-limited; large archives may fail on some devices. Uploads completed before an error remain in MEGA.
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
