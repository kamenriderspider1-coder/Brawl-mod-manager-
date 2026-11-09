# Brawl Mod Manager

A Wii-focused manager for organizing Super Smash Bros. Brawl mod profiles, with the long-term goal of keeping the mod collection on network storage rather than copying the entire collection onto the Wii.

## Project direction
- Homebrew Channel app for browsing and selecting Brawl mod profiles.
- Online catalog metadata stored separately from mod archives.
- Cloud/network delivery built around the Wii-compatible **RiiFS** protocol where supported.
- Links to creators' official releases unless redistribution permission is explicit.
- Compatibility labels for Brawl region/revision and the loader used.

## Cloud loading: the important distinction
This project is **not** trying to make the Wii connect directly to iCloud Drive or Google Drive. Riivolution supports a network filesystem called RiiFS. Its patch XML can identify a RiiFS server, allowing compatible game replacement files to be served over the Wii network.

Riivolution's documented workflow is for retail discs and its FAQ says USB loaders are not supported. A separate project, RiftWii, documents network packs and a local launch cache. That may provide a more relevant test path for USB game libraries, but it still may cache selected files locally and is not a promise of zero SD/USB usage.

## Repository layout
- `index.html`: browser catalog prototype.
- `catalog.json`: starter catalog metadata.
- `cloud/catalog.schema.json`: schema for cloud-hosted mod profile metadata.
- `cloud/catalog.example.json`: non-working example profile.
- `cloud/README.md`: cloud profile format, hosting safety, and compatibility notes.
- `wii/README.md`: Wii-side architecture and implementation plan.

## Current build status
The browser catalog and cloud-profile data format are committed. This is an early project scaffold, not a finished Wii app: there is no compiled `.dol`, deployed RiiFS server, account system, or end-to-end Brawl cloud profile tested on hardware yet.

## Next milestones
1. Build the Homebrew Channel interface and Wiimote navigation.
2. Read and validate the cloud profile catalog.
3. Prototype a RiiFS endpoint with a small, authorized test asset.
4. Test the actual Brawl launch path on the user's Wii, including the USB-loader compatibility question.
5. Add profile selection, connection diagnostics, and recovery behavior.

## References
- [Riivolution network documentation](https://riivolution.github.io/wiki/Network/)
- [Riivolution overview and FAQ](https://riivolution.github.io/wiki/Riivolution/)
- [RiftWii guide: network packs](https://github.com/KakarottoCake/Riftwii/blob/main/docs/GUIDE.md)
