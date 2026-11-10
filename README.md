# Brawl Mod Manager

A Wii-focused manager and cloud-library prototype for Super Smash Bros. Brawl mods.

## Current components

- `index.html`: browser discovery and import-queue prototype.
- `catalog.json`: starter metadata catalog with official-source links.
- `wii/`: native Homebrew Channel manager scaffold. It currently displays placeholder profiles and is not yet a Brawl in-game loader.
- `cloud/worker/`: Cloudflare Worker HTTP API backed by an R2 bucket. It serves a catalog and mod objects, with token-protected upload endpoints.
- `cloud/README.md`: profile format and hosting constraints.

## Cloud service

The Worker source and Wrangler configuration are in [cloud/worker](cloud/worker/README.md). It expects an R2 bucket named `brawl-cloud` and a Worker secret named `ADMIN_TOKEN`.

**Provisioning status:** the connected Cloudflare account currently has R2 disabled. Cloudflare returned error 10042 and requires R2 to be enabled in the Dashboard before a bucket or live service can be created. No live endpoint is deployed yet.

## Important Wii compatibility boundary

The cloud service is an HTTP API. It is not a Riivolution RiiFS server. Standard Riivolution's RiiFS network protocol is not generic HTTPS, and Cloudflare Workers do not expose a raw TCP RiiFS listener. A Wii-side HTTP client plus a Brawl runtime file-access hook would still be required to stream these objects into the game. The existing Homebrew Channel screen does not implement that hook.

This repository therefore does **not** yet provide a working zero-SD Brawl mod loader. The goal remains to keep the mod library in R2 and keep only the menu/loader components on the SD card, but that end-to-end path must be implemented and tested before it can be called functional.

## Publishing rules

Only upload mod files you created or that their authors explicitly permit you to host. Otherwise, keep metadata and links to official creator pages. Never commit Cloudflare tokens, passwords, or private credentials.
