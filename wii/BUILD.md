# Wii prototype build

This folder is the first Homebrew Channel application scaffold. It is a small native Wii program, not a web page and not a replacement game.

## Build requirements
- devkitPPC
- libogc
- devkitPro Wii build environment and wii_rules

Build from this directory in a configured devkitPro shell:

    make

The intended output is boot.dol plus meta.xml. Copy those two files into apps/brawl-mod-manager/ on an SD card for Homebrew Channel testing.

## Current prototype scope
- Initializes Wii video and controller input.
- Displays a simple profile-selection screen.
- Allows selection with Wii Remote D-pad and A.
- Returns to the Homebrew Channel menu with HOME.

## Not implemented yet
- Internet/Wi-Fi catalog retrieval.
- RiiFS server or cloud-storage account integration.
- Reading real mod manifests.
- Generating or installing Riivolution patch XML.
- Launching Riivolution or Brawl.

Do not treat the placeholder profiles as playable. The next engineering step is a tested RiiFS-compatible endpoint and a real, creator-authorized sample profile. Standard Riivolution and USB Loader GX compatibility must be tested separately.
