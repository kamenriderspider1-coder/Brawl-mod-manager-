# Brawl Cloud storage

Brawl Cloud is a standalone browser app hosted with GitHub Pages. GitHub is used to develop and publish the app; the mod files are stored in the user's own Google Drive.

## Google Drive connection

The website now includes a **Connect Google Drive** flow using Google's Identity Services OAuth token flow.

1. In Google Cloud Console, create or select a project.
2. Enable the **Google Drive API**.
3. Configure the Google Auth Platform consent screen.
4. Create an OAuth 2.0 Client ID with application type **Web application**.
5. Under **Authorized JavaScript origins**, add the exact origin where the GitHub Pages site is hosted (for this repository's standard GitHub Pages URL, use `https://kamenriderspider1-coder.github.io`; do not add a path).
6. Open Brawl Cloud, choose **Manage Storage**, paste the OAuth Client ID, and select **Connect Google Drive**.
7. Sign in to Google and approve the requested access.

Google's OAuth Client ID is a public identifier and is entered in the app. Do not create or enter a client secret in the browser app. The app requests only the `https://www.googleapis.com/auth/drive.file` scope. It creates a **Brawl Cloud** folder and a `brawl-cloud-catalog.json` file in that folder. It can manage files it creates in that app folder, rather than receiving broad access to the user's entire Drive.

The OAuth access token is kept in page memory only. It is not written to GitHub or browser local storage and is cleared when the user disconnects or closes the page. The OAuth Client ID is saved in browser local storage for convenience; it is not a secret.

## Storage behavior and limits

- Mod archives are stored in the user's Google Drive, in a folder named **Brawl Cloud**.
- The catalog is a JSON file inside that folder.
- The app has a 13 GB target limit for files listed in its Brawl Cloud catalog. This does not reserve 13 GB or increase the Google account's storage quota.
- Google account storage is shared with Google Drive, Gmail, and Google Photos.
- The current browser uploader has a conservative 20 MB per-file limit.
- Google Drive files remain subject to the user's account quota and Google's terms and API limits.
- Files in the user's Drive are not automatically public. Downloads require appropriate Google account access.
- Only upload mods you created or have permission to use and store.

## Catalog format

Catalog entries include a Google Drive `fileId`, file size, category, creator, description, compatibility, and upload date. The catalog is stored in the user's own Drive folder, not in this repository.

## Wii integration status

The Wii Homebrew app is still a prototype. It does not yet authenticate to Google Drive, fetch the Brawl Cloud catalog, download files to SD, or hand off to Riivolution. Wii networking and Google Drive integration are separate future milestones; do not assume the current Wii package can access this browser app's Drive session.
