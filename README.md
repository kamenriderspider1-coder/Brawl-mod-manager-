# Brawl Cloud + Brawl Mod Manager

This repository contains **two separate apps** that are intended to use the same library in the user's own Google Drive.

- **[Brawl Cloud](https://kamenriderspider1-coder.github.io/Brawl-mod-manager-/)** is the web app. Sign in with Google to organize, upload, and manage permitted mod files in your own Drive.
- **Brawl Mod Manager** is a separate native Wii Homebrew Channel app. It is intended to browse compatible entries from that Drive library and manage supported Wii downloads.

## Storage: your Google Drive only

**Google Drive is the storage provider.** Brawl Cloud does not require a Cloudflare account, Cloudflare R2 bucket, or a separate storage subscription. Files and the `brawl-cloud-catalog.json` catalog are stored in a `Brawl Cloud` folder in the Google account you connect.

- The website currently uses Google's Drive API with the limited `drive.file` permission.
- The current per-file upload cap is 20 MB.
- The 13 GB figure in the app is only an app-level usage target, not extra storage. Actual available space depends on the connected Google account.
- Google OAuth still needs a one-time Web Client ID configured by the app maintainer. Users should not have to paste a Client ID.
- The web app's OAuth access token is session-only and is not committed to this repository.

## Wii app and current connection status

- Native source: `wii/source/main.c`
- Homebrew metadata: `wii/meta.xml`
- Build instructions: `wii/BUILD.md`
- Release packages: [GitHub Releases](https://github.com/kamenriderspider1-coder/Brawl-mod-manager-/releases)

The Wii app is currently a profile-menu prototype. It does **not** yet sign in to Google Drive, fetch the private Drive catalog, download files to SD, or launch Riivolution. The Wii cannot reuse the browser's private sign-in session automatically.

To connect the Wii directly to Drive, the next implementation needs a Wii-compatible, secure Google authorization/download design. Private Drive files must remain private unless the user deliberately chooses to share them. Do not publish private mod files or embed account tokens in the Wii executable.

## Mod permissions

Only upload files you created or have permission to store and share. Otherwise, keep catalog metadata and link to the creator's official download page.
