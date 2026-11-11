# Brawl Mod Manager cloud API

This Worker is a small, read-only API deployed by GitHub Actions. It is not hosted by GitHub Pages and it does not run on the Mac.

## Endpoints

- `GET /` or `GET /api/health`: service status and explicit capability list.
- `GET /api/catalog`: returns the committed `catalog.json`.
- `OPTIONS`: CORS preflight for the published GitHub Pages origin.

The API deliberately does not accept uploads or execute downloaded files. It does not connect to MEGA, extract mod archives, or serve a RiiFS filesystem. Those features require a separate authenticated storage implementation and a tested Wii-compatible delivery service.

## One-time GitHub setup

In the repository, open **Settings → Secrets and variables → Actions → New repository secret** and add:

- `CLOUDFLARE_API_TOKEN`: a Cloudflare API token with permission to edit Workers Scripts for the intended account.
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID.

Do not put either value in a committed file, GitHub Pages, or a chat message.

After both secrets exist, the workflow deploys automatically when files under `cloud/worker/` or the deploy workflow change. You can also run **Actions → Deploy Brawl Mod Cloud → Run workflow**.

## Result

The deployed address is the Worker URL shown in the successful GitHub Actions log, normally:

`https://brawl-mod-manager-api.<your-workers-subdomain>.workers.dev`

GitHub cannot create the Cloudflare account token or silently grant itself access to your Cloudflare account. If the two repository secrets are missing, deployment stops safely with a clear error.
