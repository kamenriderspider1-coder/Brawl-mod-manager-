# Brawl Mod Manager

A Wii-focused manager for discovering Super Smash Bros. Brawl mods, organizing selected mod profiles, and preparing a private cloud library.

## Project direction
- A Homebrew Channel app for browsing and selecting Brawl mod profiles.
- A browser-based discovery/library interface.
- Cloud-hosted mod files kept separate from the public GitHub source repository.
- RiiFS/network delivery where supported by the selected Wii loader.
- Creator/source links and permission checks before files are mirrored.

## Current browser app
The GitHub Pages prototype now includes:
- Search shortcuts for BrawlVault, GameBanana, and general web results.
- A form for adding a mod's creator page, optional direct download URL, type, creator, region, and notes.
- A browser-local import queue.
- A permission confirmation before a mod record can enter the queue.

The queue is currently stored in the browser's local storage. It does **not** download files or upload them to a cloud provider yet. Search shortcuts open source websites; they do not crawl or mirror all internet content.

## Discovery sources
- [BrawlVault](https://forums.kc-mm.com/Gallery/): community Brawl resource directory. Its current availability/restoration status may affect searches.
- [GameBanana API](https://api.gamebanana.com/): documented API, but Brawl-specific coverage must be confirmed before treating it as a complete Brawl catalog.
- General web search: useful for creator release pages and community threads, but results must be checked manually.

A source connector should use an official API/feed where available, cache results, respect rate limits and terms, and keep creator attribution. Some download pages may require a human click-through or may not permit automated downloading.

## Cloud storage design
GitHub is for app source and catalog metadata, not the user's large private mod archive. The next step is to select a storage provider and implement a secure sign-in/upload adapter. Do not paste secret credentials into this public repository. Upload only files the creator permits you to store, and keep source URL, creator, permission basis, file size, and checksum with each stored object.

## Wii loading constraints
This project is not trying to make the Wii connect directly to iCloud Drive. Riivolution supports the RiiFS network filesystem. Standard Riivolution is designed for retail discs; USB-loader compatibility needs a separate tested path. A network profile may still need local launch/configuration files or a cache. No zero-local-storage guarantee is made.

## Repository layout
- `index.html`: browser discovery and import-queue prototype.
- `catalog.json`: starter catalog metadata.
- `cloud/catalog.schema.json`: cloud profile metadata schema.
- `cloud/catalog.example.json`: non-working example profile.
- `cloud/README.md`: cloud profile and hosting notes.
- `wii/README.md`: Wii-side architecture and implementation plan.

## Build status
The browser discovery/import-queue interface and cloud profile schema are committed. The queue currently stores metadata in the browser only. There is no connected cloud-storage provider, automatic file importer, deployed RiiFS server, compiled Wii `.dol`, or end-to-end Brawl cloud profile tested on hardware.

## Next milestones
1. Choose the private cloud-storage provider.
2. Build a secure account connection and upload adapter.
3. Add supported source-specific search/API connectors and rate-limited metadata indexing.
4. Add a user-approved download and upload pipeline for permitted files.
5. Build the Wii Homebrew Channel interface and test network loading with the user's actual game-launch setup.

## References
- [GameBanana API](https://api.gamebanana.com/)
- [Riivolution network documentation](https://riivolution.github.io/wiki/Network/)
- [Riivolution overview and FAQ](https://riivolution.github.io/wiki/Riivolution/)
- [RiftWii guide: network packs](https://github.com/KakarottoCake/Riftwii/blob/main/docs/GUIDE.md)
