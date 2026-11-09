# Brawl Mod Manager: Wii Homebrew prototype

This is a companion profile manager for the existing Super Smash Bros. Brawl game. It is not a separate game and it is not a replacement or fork of Riivolution.

## Current native Wii app scaffold

The first Homebrew Channel application source is in this folder:
- `source/main.c`: native Wii video/controller initialization and a basic profile-selection screen.
- `Makefile`: devkitPPC/libogc build configuration.
- `meta.xml`: Homebrew Channel app metadata.
- `BUILD.md`: build instructions and current limitations.
- `riivolution/README.md`: notes for future Riivolution/RiiFS integration.

The current screen uses placeholder profiles only. It does not yet connect to Wi-Fi, fetch the cloud catalog, create Riivolution XML, start Riivolution, or launch Brawl.

## Cloud goal

The intended storage experience is iCloud-like: keep the mod library on an internet-accessible server and let compatible Wii loading software request files over the network. Riivolution's RiiFS support is the protocol direction to investigate. RiiFS is not generic HTTPS or direct iCloud Drive access; a compatible server is required.

## Important compatibility warning

Standard Riivolution is designed for retail-disc patching. USB Loader GX compatibility is a separate issue and must be tested. Do not assume this app can launch Riivolution or load network assets through USB Loader GX until an end-to-end test succeeds.

## Build status

The source scaffold has been committed, but no compiled `boot.dol` is included. Build it with devkitPPC and libogc in a configured devkitPro environment, then test in Dolphin and on the Wii. Network catalog, RiiFS integration, mod-profile parsing, and launch handoff remain future milestones.
