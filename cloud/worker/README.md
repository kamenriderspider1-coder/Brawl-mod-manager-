# Brawl Mod Cloud

Cloudflare Worker HTTP API backed by the Cloudflare R2 bucket `brawl-cloud`.

## API

- `GET /health` - service health and capability notice.
- `GET /v1/catalog` - reads `catalog.json` from R2.
- `GET /v1/mods/<key>` - streams the R2 object `mods/<key>`.
- `PUT /v1/admin/objects/<key>` - uploads an object to `mods/<key>`; requires `x-admin-token`.
- `PUT /v1/admin/catalog` - replaces `catalog.json`; requires `x-admin-token`.

The API is read-only to public callers. Upload routes require the Worker secret `ADMIN_TOKEN` (at least 24 characters). Do not put that secret in the Wii app, browser code, or this repository.

## Cloudflare setup

1. Enable R2 in the Cloudflare Dashboard for the connected account.
2. Create an R2 bucket named `brawl-cloud`.
3. Deploy this Worker with the included `wrangler.toml`.
4. Add a Worker secret named `ADMIN_TOKEN` using a long random value.
5. Test `/health`, then upload a creator-authorized mod file and publish its metadata in `catalog.json`.

R2 was not enabled on the connected account when this project was checked. Cloudflare returned error 10042 ("Please enable R2 through the Cloudflare Dashboard"), so the bucket and live service cannot be provisioned until that one-time account activation is completed.

## Wii compatibility boundary

This is an HTTP object/catalog service, not a Riivolution RiiFS server. Standard Riivolution's RiiFS network protocol is not generic HTTPS, and a Cloudflare Worker does not expose a raw TCP RiiFS listener. A separate Wii-side HTTP loader and a Brawl runtime file-access hook would still be needed to consume these objects inside the game. The current Homebrew Channel manager scaffold does not implement that hook, so this service alone does not make Brawl stream mods from R2.

Only upload mods that you created or that their authors explicitly permit you to host. Otherwise keep catalog entries as links to the creators' official downloads.
