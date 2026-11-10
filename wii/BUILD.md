# Wii SD-card manager build

This folder contains a native Wii Homebrew Channel application.

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

## Manual Google Drive transfer

Download mods from the normal Google Drive website on a computer, then copy them into `sd:/brawl-mods/`. The Wii app makes no network requests and uses no Google API or account credentials.

## Not implemented
- Installing or activating mod files.
- Generating Riivolution XML.
- Launching Riivolution or Brawl.
- Verifying individual mod compatibility.

A file appearing in the list does not mean it is safe or compatible to load. Test mods with the appropriate loader instructions.
