# Brawl Mod Manager for Wii

A **standalone Wii Homebrew Channel application** intended to be the console-side companion to the separate Brawl Cloud website.

## Two-app design

- **Brawl Cloud (web):** Google sign-in, mod uploads, metadata, and library management. The user's own Google Drive is the storage.
- **Brawl Mod Manager (Wii):** intended to browse compatible entries from the same Google Drive library and manage supported downloads to SD.

## Storage choice

Google Drive is the intended storage provider. The project does not require Cloudflare R2 or a separate storage bucket. The web app currently stores its files and catalog directly in the connected user's Drive.

## Current native Wii app scaffold

- `source/main.c`: native Wii video/controller initialization and basic profile-selection screen.
- `Makefile`: devkitPPC/libogc build configuration.
- `meta.xml`: Homebrew Channel app metadata.
- `BUILD.md`: build instructions and limitations.
- `riivolution/README.md`: future loader integration notes.

The current screen is a prototype with placeholder profiles. It does not yet connect to Google Drive, fetch the private catalog, download files to SD, create Riivolution XML, start Riivolution, or launch Brawl.

## Google Drive connection still to build

The Wii cannot automatically reuse the Google sign-in session from Safari or the Brawl Cloud website. A Wii-compatible authorization and download method must be implemented and tested. Private Drive files must not be made public automatically, and Google account tokens must not be embedded in the app.

## Mod loading limitations

Downloading a file from Drive does not by itself inject assets into Brawl. A separate, tested handoff or file-access integration is required. Riivolution and USB Loader GX compatibility must not be assumed.

## Build status

This source scaffold is not a complete Drive-connected manager. Build with devkitPPC/libogc, then test in Dolphin and on a real Wii. Drive catalog access, downloads, profile parsing, and supported loader handoff remain future milestones.
