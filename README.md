# Brawl Cloud + Brawl Mod Manager

This repository contains Brawl Cloud, a free public mod-file library, and a native Wii Homebrew Channel file manager.

- **[Brawl Cloud website](https://kamenriderspider1-coder.github.io/Brawl-mod-manager-/)** explains and links to the mod library.
- **[Mod library / GitHub Releases](https://github.com/kamenriderspider1-coder/Brawl-mod-manager-/releases)** stores downloadable release assets.
- **Brawl Mod Manager** scans files already copied to the Wii SD card.

## MEGA connection status

The website currently provides a shortcut to the configured **MEGA / Brawl Mods** folder. That shortcut opens MEGA's official website; it is **not** an account connection, and signing in on mega.nz does not authorize this GitHub Pages app to upload files.

A genuine in-app MEGA connection is **not implemented yet**. MEGA's terms require developers who directly use its API to register and obtain approval before publishing an application that uses it. A normal MEGA account login does not remove that requirement. There is no paid API subscription configured in this repository, and no MEGA credentials, session IDs, or encryption keys should be placed in GitHub files or sent to the Cloudflare Worker.

Until an approved integration is available, the working route is:
1. Use the app to find and download a supported mod archive to your device.
2. Open the MEGA folder using the button in the app and sign in on MEGA's official site.
3. Upload the downloaded archive or reviewed extracted files using MEGA's own interface.

The app must not display a success state or claim that files were uploaded unless a real authenticated upload has completed.

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

## Play setup builder

The website includes a two-mode setup builder:
- **Custom Mix** supports selecting individual assets from multiple catalog entries when verified per-file manifests are published.
- **Full Mod** lets the user choose one complete game build without mixing its files with other builds.
- Selections are saved in the current browser only; they are not synced to MEGA or the Wii.

The current `cloud-mods.json` contains source-level mod entries, not verified inventories of files inside each archive. Individual asset choices therefore remain empty until per-file manifests are added. The website does not invent filenames or mark unlisted assets as available.

This is a configuration interface only. It does not yet transfer files to MEGA, connect to the Wii, or launch Brawl. The Wii network client, secure MEGA integration, asset manifests, and compatible loader/remote-file bridge remain unfinished.
