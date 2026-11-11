# MEGA integration status

## Current state

The GitHub Pages Cloud Storage app is a static front end. It does not have a working MEGA account connection, file browser, downloader, extractor, or upload service.

Opening the MEGA website sign-in page is not an authorization grant to this app.

## Authentication and security

- Do not collect MEGA passwords in the public GitHub Pages app.
- Do not commit MEGA session IDs, master keys, OAuth tokens, or other credentials to GitHub.
- The official MEGA SDK is a native C++ client access engine. It is not a drop-in browser OAuth flow.
- The commonly used MEGAJS JavaScript package is unofficial and account login uses an email and password. Do not embed that credential flow in this public site.
- A production integration needs a separately deployed, security-reviewed service that uses an appropriate supported MEGA client implementation and protects account session material server-side.

## Required implementation

1. Establish an approved MEGA client integration and its permitted authentication method.
2. Deploy a private backend with encrypted secret/session storage, access controls, and audit-safe logs.
3. Implement account connection status and folder selection without exposing credentials to the browser.
4. Download only permitted mod archives from creator-provided source pages.
5. Validate archive type, size, integrity, and extraction paths before extracting.
6. Separate standalone Brawl builds from add-ons and mark REX compatibility only when verified.
7. Upload extracted mod files into `MEGA/Brawl Mods/`.
8. Publish file metadata to the Wii library only after upload verification.

## Current safety state

MEGA connection and upload controls remain disabled until the backend is deployed and tested. The app must never claim a mod is playable merely because a source page exists.
