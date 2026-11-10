# ☁️ Brawl Cloud Storage

> **[☁️ Open Brawl Cloud and connect your Google Drive](https://kamenriderspider1-coder.github.io/Brawl-mod-manager-/)**
>
> When the app opens, choose **Sign in to Google Drive**. The first visit requires a one-time Google OAuth Web Client ID setup. Follow the on-screen setup instructions. Google sign-in happens on Google's own authorization page.

Brawl Cloud is the cloud-storage companion for the Brawl Mod Manager. **GitHub is used to build and publish the application; your own Google Drive stores your mod files.** The app is designed around a 13 GB library target within your Google account's existing storage quota.

---

# Brawl Mod Manager

This repository contains two connected project components:

1. **Brawl Cloud**: a browser-based mod library that stores your files in your own Google Drive after you authorize it.
2. **Wii Mod Manager**: a separate Homebrew Channel manager prototype. Its downloadable package belongs in GitHub Releases.

## Brawl Cloud

- Website entry point: `index.html`
- Google Drive folder: `Brawl Cloud` (created after you authorize the app)
- Catalog: `brawl-cloud-catalog.json` inside that Drive folder
- Google permission requested: `drive.file`, which limits access to files created or explicitly opened with this app.
- The Google OAuth access token is kept in page memory and is not committed to this repository.
- A 13 GB app-level target is enforced for catalogued files. This is not reserved space and does not increase your Google account quota.
- Current browser uploader limit: 20 MB per file.

### One-time Google setup

1. Open [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Select or create a Google Cloud project and enable the **Google Drive API**.
3. Configure the Google Auth Platform consent screen.
4. Create an OAuth 2.0 Client ID with application type **Web application**.
5. Add the exact deployed website origin to **Authorized JavaScript origins**. For this repository's standard GitHub Pages URL, use `https://kamenriderspider1-coder.github.io` (origin only, no path).
6. Open Brawl Cloud, paste the public OAuth Client ID, and select **Connect Google Drive**.
7. Complete Google's authorization flow.

Never put a Google OAuth client secret, password, or access token in this public repository or into the browser app. The Client ID is a public identifier; the access token is session-only.

**Important:** GitHub repository pages and README files cannot display a live Google sign-in dialog or run the app's JavaScript. The prominent link above opens the independent GitHub Pages app, where the sign-in prompt lives.

## Publishing Brawl Cloud

The `.github/workflows/deploy-pages.yml` workflow publishes the static site with GitHub Pages. In repository Settings → Pages, choose **GitHub Actions** as the source if needed.

## Wii Mod Manager Releases

The `.github/workflows/build-wii.yml` workflow is separate. When its build succeeds, it publishes the Wii manager package:

- `boot.dol`
- `meta.xml`
- `brawl-mod-manager-wii.zip`

Releases: https://github.com/kamenriderspider1-coder/Brawl-mod-manager-/releases

## Wii compatibility status

The current native Wii app is still a profile-menu prototype. It does not yet authenticate to Google Drive, fetch the Brawl Cloud catalog, download files to SD, hook Brawl's file access, or load network mods inside the game. That end-to-end loader still needs to be implemented and tested on Dolphin and a real Wii.

## Mod permissions

Only upload mods you created or have permission to store and share. For other mods, use the creator's official download or project page rather than rehosting files without permission.
