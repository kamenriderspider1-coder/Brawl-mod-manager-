# Wii manager build

This folder contains the native Wii Homebrew Channel application.

## Build requirements
- devkitPPC
- libogc and libfat
- devkitPro Wii build environment and `wii_rules`

Build from this directory in a configured devkitPro shell:

    make

The intended output is `boot.dol` plus `meta.xml`. Copy those files into `apps/brawl-mod-manager/` on the SD card.

## Current scope
- Initializes Wii video and controller input.
- Mounts the SD card with libfat.
- Scans `sd:/brawl-mods/` and lists up to 24 filenames.
- D-pad selects, A shows the selected filename, B rescans, HOME/START exits.

## Brawl Cloud storage

Brawl Cloud uses public GitHub Releases in this repository as its free mod-file library. Browse and download files at:

https://github.com/kamenriderspider1-coder/Brawl-mod-manager-/releases

The current Wii app does not connect to GitHub and does not download files over Wi-Fi. Download release files on a computer and copy supported files to the SD card.

## Not implemented
- Wii network initialization for this app.
- HTTPS/TLS or GitHub download support.
- Parsing an online mod catalog.
- Installing or activating mod files.
- Generating Riivolution XML.
- Launching Riivolution or Brawl.
- Verifying individual mod compatibility.

Direct online syncing needs a tested HTTPS client, redirect handling, download progress, file-size checks, and safe SD writes. A working home Wi-Fi connection by itself is not enough.
