# Brawl Cloud + Brawl Mod Manager

This repository contains **two separate apps connected by one shared cloud library**.

- **[Brawl Cloud](https://kamenriderspider1-coder.github.io/Brawl-mod-manager-/)** is the web app. Use it on a computer or phone to sign in, organize the library, upload permitted mod files, and manage catalog entries.
- **Brawl Mod Manager** is a separate native Wii Homebrew Channel app. It runs on the Wii and is intended to browse the shared catalog, select compatible mod profiles, and prepare files for the Wii's mod-loading workflow.

They are not two tabs in one app. Brawl Cloud is the storage/control website; Brawl Mod Manager is the console-side companion.

## How the two apps are intended to connect

```
Brawl Cloud (web)
  |  uploads authorized files and publishes catalog metadata
  v
Shared cloud API + object storage
  |  public read-only catalog and mod downloads
  v
Brawl Mod Manager (Wii homebrew)
  |  downloads compatible files to SD / hands off to supported loader
  v
Wii mod setup
```

The Wii app must never contain Google passwords, OAuth refresh tokens, or cloud administrator credentials. The web app handles account sign-in and upload permissions. The Wii app should only use a deliberately designed read-only download interface.

## Brawl Cloud web app

- Website: [Open Brawl Cloud](https://kamenriderspider1-coder.github.io/Brawl-mod-manager-/)
- Source: `index.html`
- Current browser sign-in/storage implementation: Google Drive OAuth using the limited `drive.file` permission.
- Current per-file upload cap: 20 MB.
- The 13 GB figure is an app-level target, not additional Google storage.

**Google OAuth setup is not yet complete.** A registered Google OAuth Web Client ID is required before the real Google account chooser and Drive connection can work. It must be configured once by an eligible app administrator. The site must not ask each user to paste a Client ID.

## Wii Brawl Mod Manager

- Native source: `wii/source/main.c`
- Homebrew metadata: `wii/meta.xml`
- Build instructions: `wii/BUILD.md`
- Release packages: [GitHub Releases](https://github.com/kamenriderspider1-coder/Brawl-mod-manager-/releases)

The current Wii executable is a profile-menu prototype. It does not yet fetch the shared catalog, download files to SD, or launch Riivolution. Those features must be implemented and tested separately.

## Important cloud integration detail

The current web app stores files in Google Drive, while the planned Wii-facing API under `cloud/worker/` is designed for Cloudflare R2. These are **not connected yet**. A secure publishing/sync step or a single shared storage backend must be implemented before uploads made on the website appear in the Wii manager. The Wii cannot simply reuse the browser's private Google Drive session.

The Cloudflare Worker is a read-only public catalog/download API with administrator-only upload routes. It still requires an enabled R2 bucket, deployment, and secrets configured outside this public repository. Never put an admin token or OAuth secret in the Wii app or browser source.

## Mod permissions

Only upload files you created or have permission to store and share. Otherwise, keep catalog metadata and link to the creator's official download page.
