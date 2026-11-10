# Brawl Mod Manager for Wii

A **standalone Wii Homebrew Channel application** that will act as the console-side companion to the separate Brawl Cloud website.

## Two-app design

- **Brawl Cloud (web):** account sign-in, mod storage, uploads, metadata, and catalog publishing.
- **Brawl Mod Manager (Wii):** browse the shared catalog, select Wii-compatible profiles, and manage supported downloads on the SD card.

The Wii app does not host the library and must not contain Google sign-in credentials or cloud administrator secrets. It should consume a read-only catalog/download API.

## Current native Wii app scaffold

- `source/main.c`: native Wii video/controller initialization and basic profile-selection screen.
- `Makefile`: devkitPPC/libogc build configuration.
- `meta.xml`: Homebrew Channel app metadata.
- `BUILD.md`: build instructions and limitations.
- `riivolution/README.md`: future loader integration notes.

The current screen is still a prototype with placeholder profiles. It does not yet connect to Wi-Fi, fetch Brawl Cloud's catalog, download files to SD, create Riivolution XML, start Riivolution, or launch Brawl.

## Shared cloud connection

The planned API lives in `../cloud/worker/`. It is designed around a public read-only catalog and mod-download endpoints, with separate administrator-only publishing routes. The web app currently uses Google Drive, while this Worker is designed for Cloudflare R2; they are not synchronized yet. A publishing/sync service or unified storage backend is required before the Wii app can see website uploads.

The Wii client must validate catalog data, restrict downloads to approved catalog URLs, handle interrupted downloads safely, and avoid storing credentials. Network transport and TLS compatibility must be tested on real Wii hardware.

## Mod loading limitations

Riivolution's RiiFS network protocol is not generic HTTPS and is not the same thing as downloading a file from the cloud API. Network catalog/download support alone does not inject assets into Brawl. A separate, tested handoff or file-access integration is required. Compatibility with USB Loader GX must not be assumed.

## Build status

This source scaffold is not a complete cloud-connected manager. Build with devkitPPC/libogc, then test in Dolphin and on a real Wii. Cloud catalog, download-to-SD, profile parsing, and supported loader handoff remain future milestones.
