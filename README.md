# Brawl Cloud + Brawl Mod Manager

This repository contains two separate apps with a **Google Drive only, manual-transfer workflow**.

- **[Brawl Cloud](https://kamenriderspider1-coder.github.io/Brawl-mod-manager-/)** is a simple website shortcut and guide for your own Google Drive.
- **Brawl Mod Manager** is a separate native Wii Homebrew Channel app that scans mod files copied onto the Wii SD card.

## Storage: Google Drive only

Brawl Cloud opens the normal Google Drive website. Create a folder named `Brawl Cloud` in your own Drive and manage your files there.

There is:
- No Google Drive API integration.
- No OAuth, Client ID, API key, or sign-in inside Brawl Cloud.
- No Google Cloud Storage, Cloudflare R2, or other storage service.
- No access to your Google account shared with the app or repository.

## Manual transfer to the Wii

1. Open Brawl Cloud and click **Open Google Drive**.
2. Upload permitted mod files to your `Brawl Cloud` folder.
3. Download a mod file from Drive onto your computer.
4. Copy it to `sd:/brawl-mods/` on the Wii SD card.
5. Open Brawl Mod Manager from the Homebrew Channel. It scans that folder and displays the files it finds.

The Wii manager is currently an SD-card file browser. It does not install or activate mods, generate Riivolution XML, or patch Brawl. Those functions require separate loader integration and testing.

## Wii app

- Native source: `wii/source/main.c`
- Build instructions: `wii/BUILD.md`
- Release packages: [GitHub Releases](https://github.com/kamenriderspider1-coder/Brawl-mod-manager-/releases)

Only download and use mod files you created or are allowed to use.
