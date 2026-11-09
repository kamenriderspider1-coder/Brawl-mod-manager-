# Brawl Mod Manager: cloud-hosted RiiFS catalog and launcher

## Intended experience
This is **not a separate game**. The manager appears in the Homebrew Channel, lets the user browse Brawl mods, and launches the user's existing Super Smash Bros. Brawl with a compatible mod setup.

The user's goal is iCloud-style storage: mod files stay on an internet-accessible server, and the Wii reads them over Wi-Fi rather than storing the full collection on its SD card or USB drive.

## Important discovery: Riivolution already has network filesystem support
Riivolution supports a network filesystem protocol called **RiiFS**. Its network patch XML can point the Wii to a server address and port, and Riivolution can stream patch files from that server during gameplay. This is much closer to the requested cloud-storage experience than building an SMB-only solution from scratch.

References:
- Riivolution network documentation: https://riivolution.github.io/wiki/Network/
- Riivolution overview and compatibility notes: https://www.wiibrew.org/wiki/Riivolution

This does **not** mean the Wii can connect to Apple's iCloud Drive directly. The files need to be hosted by a server that speaks the RiiFS protocol. A custom cloud-hosted RiiFS server or relay would be needed, and it must be reachable by the Wii over the internet. Hosting, authentication, server uptime, bandwidth, and secure access still need to be designed and tested.

## Proposed workflow
1. The Homebrew Channel launches the manager from the small app files on SD.
2. The manager retrieves the mod catalog and connection profile.
3. The selected profile identifies a RiiFS-compatible server and the mod's Riivolution patch XML.
4. Riivolution connects to the configured RiiFS server over the Wii's internet connection.
5. Mod assets are read from the server as the game requests them, instead of copying the complete mod collection onto SD/USB.

A small local bootstrap/configuration file may still be needed to start the manager or supply the network endpoint. The target is **no permanent local copy of the mod collection**, not a promise that absolutely no bytes or configuration are ever stored locally.

## Critical compatibility limits
- Riivolution's documented network feature uses RiiFS, not generic iCloud, Google Drive, Dropbox, SMB, or arbitrary HTTPS file URLs.
- Riivolution's overview states that it does not work with backups or USB loaders. The user's current USB Loader GX setup therefore needs a compatibility decision and real testing. A disc-based Brawl launch may be required for standard Riivolution.
- The network documentation describes a server address and port. Public-internet hosting needs router/server configuration and secure design; do not expose an unprotected file server.
- Internet latency, Wii Wi-Fi reliability, server uptime, file sizes, and Brawl's loading behavior can affect performance.
- Each mod still needs a valid Riivolution patch definition and compatible Brawl region/version.
- Do not claim every mod or every launch method works until tested on the user's hardware.

## Implementation plan
1. Build the Homebrew Channel manager UI and catalog reader.
2. Define a mod manifest: title, creator/source, Brawl region/version, Riivolution XML, RiiFS server profile, dependencies, and license/redistribution terms.
3. Prototype a RiiFS-compatible server and test a small, permitted Brawl replacement asset.
4. Confirm whether the user's game launch path can use Riivolution. Test disc launch separately from USB Loader GX.
5. Add account/profile handling without embedding passwords in public catalog files.
6. Test loading time, disconnect recovery, and server availability on real Wii hardware.
7. Produce a compiled `.dol` and document exactly which mod formats and launch paths are supported.

## Build status
This is a design specification, not a compiled or tested Wii executable or deployed cloud service. No RiiFS server has been deployed, and no end-to-end cloud Brawl mod has been verified yet.
