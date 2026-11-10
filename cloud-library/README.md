# Brawl Cloud storage

Brawl Cloud is a browser-based file manager backed by this GitHub repository. The website is in the root `index.html`; the public catalog and uploaded files live in this folder.

## Features in the website

- Browse the public mod catalog without signing in.
- Search by mod name, creator, description, or compatibility.
- Filter by category and sort by newest or name.
- Download files stored in `cloud-library/files/`.
- Upload permitted files and add their metadata to the catalog.
- Remove a listed file from the catalog and repository.

## Uploading from the website

1. Open the Brawl Cloud website and choose **Manage Storage**.
2. Create a GitHub fine-grained personal access token restricted to this repository.
3. Grant **Contents: Read and write** only. Do not grant unrelated permissions.
4. Enter the token into the app. It is kept in page memory only, the input is cleared after connecting, and the app does not save it in local storage or commit it.
5. Choose a file no larger than 20 MB, fill in the details, and upload it.

The token is a powerful credential. Never paste it into a chat, commit it, or share it. Disconnect when finished. If it is exposed, revoke it in GitHub settings.

## Public storage and limits

- This repository is public. Every uploaded file and catalog entry is public and can be copied by anyone.
- Only upload files you created or have clear permission to redistribute.
- This is not private or unlimited storage. GitHub imposes repository and file-size limits; the website uses a conservative 20 MB per-file limit.
- Keep archives reasonably sized. For larger files, link to the creator's official download page instead of mirroring the archive.
- Do not upload passwords, access tokens, personal information, or private files.

## Catalog format

- `catalog.json` is the public index read by the website.
- `files/` stores permitted downloadable files.
- `schema.json` documents the catalog format.

Example entry:

```json
{
  "name": "Example Pack",
  "type": "mod-pack",
  "creator": "Creator name",
  "summary": "Short description.",
  "compatibility": "State the tested game/mod version",
  "file": "cloud-library/files/example-pack.zip",
  "size": 123456,
  "uploadedAt": "2026-11-09T20:00:00.000Z",
  "source": "https://creator.example/download-page"
}
```

The example is documentation only, not an actual downloadable mod.

## Wii integration status

The website's cloud file manager and the Wii Homebrew app are separate pieces. The Wii prototype does not yet authenticate to GitHub, fetch this catalog, download files to SD, or hand off to Riivolution. Those Wii networking and game integration milestones still need to be implemented and tested.
