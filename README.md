# Brawl Cloud + Brawl Mod Manager

This repository contains Brawl Cloud, a free public mod-file library, and a native Wii Homebrew Channel file manager.

- **[Brawl Cloud website](https://kamenriderspider1-coder.github.io/Brawl-mod-manager-/)** explains and links to the mod library.
- **[Mod library / GitHub Releases](https://github.com/kamenriderspider1-coder/Brawl-mod-manager-/releases)** stores downloadable release assets.
- **Brawl Mod Manager** scans files already copied to the Wii SD card.

## Free cloud storage

Brawl Cloud uses GitHub Releases in this repository as its public file library. Mod archives are attached to releases and downloaded through their public release links.

There is no separate storage subscription, Google Drive connection, Google API key, OAuth login, or paid API service. Release assets are public, so only upload files you created or are allowed to distribute. Keep private files and personal information out of public releases.

To add a mod archive:
1. Open [New GitHub Release](https://github.com/kamenriderspider1-coder/Brawl-mod-manager-/releases/new).
2. Add a clear release title and description.
3. Attach the mod archive(s) to the release.
4. Publish the release. It will appear in the Brawl Cloud library link.

## Wii transfer status

The current Wii v20 app is an SD-card file browser. It scans `sd:/brawl-mods/` and lists local files. It does **not** yet connect to GitHub or download files over Wi-Fi.

Direct Wii syncing is a separate development step. It requires:
- Wii network initialization and reliable connection handling.
- HTTPS/TLS support for secure GitHub downloads.
- A catalog format the Wii app can parse.
- Download progress, redirect handling, file-size checks, and safe writes to the SD card.

The Wii's built-in internet connection alone does not add these features. Do not treat the current v20 release as having online download support.

## Build

Requirements: devkitPPC, libogc, libfat, and the devkitPro Wii build environment.

From `wii/` in a configured devkitPro shell:

```sh
make
```

The intended output is `boot.dol` plus `meta.xml`. Copy those files into `sd:/apps/brawl-mod-manager/`.

## Current Wii app scope

- Initializes Wii video and controller input.
- Mounts the SD card with libfat.
- Scans `sd:/brawl-mods/` and lists up to 24 filenames.
- D-pad selects, A shows the selected filename, B rescans, HOME/START exits.

It does not install or activate mods, generate Riivolution XML, or patch Brawl. A file appearing in the list does not mean it is safe or compatible to load.
