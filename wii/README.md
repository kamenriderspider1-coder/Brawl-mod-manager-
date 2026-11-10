# Brawl Mod Manager for Wii

A standalone Wii Homebrew Channel app that browses mod files copied to the SD card.

## Google Drive workflow

Google Drive is used manually through its normal website. The project does not connect to Drive programmatically.

1. Store mod files in your own Google Drive folder named `Brawl Cloud`.
2. Download the files you want to use.
3. Copy them to `sd:/brawl-mods/` on the Wii SD card.
4. Launch Brawl Mod Manager from the Homebrew Channel and browse the files.

No API, OAuth, Client ID, API key, cloud bucket, or Google account credentials are used by the Wii app.

## Current native app

- `source/main.c`: initializes Wii video/controllers, mounts the SD card, and lists files in `sd:/brawl-mods/`.
- `Makefile`: devkitPPC/libogc build configuration, including libfat.
- `meta.xml`: Homebrew Channel metadata.
- `BUILD.md`: build instructions.

Controls: D-pad to select, A to show the selected filename, B to rescan, HOME/START to exit.

## Important limitation

This version only displays files found on the SD card. It does not install, activate, or apply mods to Super Smash Bros. Brawl. Riivolution patch generation and supported loader integration remain separate work and must be tested before claiming compatibility.
