# Wii SD-card Mod Manager

## Intended experience
The user launches this manager from the Homebrew Channel on a modded Wii. The manager reads its catalog from the internet, displays individual Brawl mods, and downloads a selected, author-authorized file to the SD card or USB device. It should not require a phone or computer for routine browsing and downloads once installed.

## Known target
- Console: Wii, 4.3U
- Storage: SD card and/or USB
- Launch environment: Homebrew Channel
- Game: Super Smash Bros. Brawl (USA)
- Catalog source: this repository's catalog.json

## Required screens
1. Connection status and storage selection.
2. Online catalog with category and text filtering.
3. Mod details: author/source, region, game version, loader, install path, dependencies, and conflict notes.
4. Download confirmation showing destination and required free space.
5. Download progress, integrity check, and completion/error status.
6. Installed-mod list with safe remove/replace actions.

## Download and installation rules
- Never overwrite a file without an explicit confirmation and backup/restore plan.
- Verify downloaded size and SHA-256 when the manifest provides it.
- Keep each mod's archive separate until its install layout is understood.
- Only automate extraction/install for formats and layouts explicitly supported by the app.
- Link to creator pages and do not mirror files unless redistribution is permitted.
- Preserve the original download URL and author attribution in the local install record.

## Network engineering constraint
The Wii homebrew app needs a Wii-compatible networking and HTTPS strategy. Modern GitHub endpoints may require TLS/certificate features not available in a basic Wii homebrew networking setup. Do not assume that a direct GitHub API connection will work. Prototype connectivity first, then choose either a compatible HTTPS implementation or a small relay service that fetches the catalog/files and exposes a Wii-compatible endpoint. Do not ship a relay that weakens transport security or silently proxies arbitrary URLs.

## Build status
This document specifies the target experience. It is not a compiled Wii executable. A working Homebrew Channel app still needs C/C++ source, devkitPPC/libogc build configuration, a compiled `.dol`, and testing on Dolphin and real Wii hardware.
