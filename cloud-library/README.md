# Brawl Cloud storage

This folder is the repository-backed storage area for the Brawl Cloud project.

## What is stored here

- `catalog.json` is the public index that the Brawl Cloud website reads.
- `files/` is where permitted mod archives and other downloadable assets are stored.
- `schema.json` documents the catalog entry format.

GitHub is the cloud host in this design. There is no separate Cloudflare bucket or external storage account involved.

## Add a mod

1. Add the archive to `files/` (for example, `files/example-pack.zip`).
2. Add an entry to the `entries` array in `catalog.json`.
3. Set `file` to the repository-relative path, such as `cloud-library/files/example-pack.zip`.
4. Commit the changes. After the GitHub Pages site deploys, the item will appear in the public library.

Example catalog entry:

```json
{
  "name": "Example Pack",
  "type": "mod-pack",
  "creator": "Creator name",
  "summary": "Short description.",
  "compatibility": "State the tested game/mod version",
  "file": "cloud-library/files/example-pack.zip",
  "source": "https://creator.example/download-page"
}
```

The example is documentation only, not an actual downloadable mod.

## Important limits

- This is public storage: anyone who can access the repository can access its published files.
- It is not unlimited storage. Keep archives reasonably sized and use official creator download pages for large files.
- Only upload files you created or have clear permission to redistribute.
- Do not put passwords, access tokens, private files, or personal information here.
- The current Wii Homebrew app does not yet fetch this catalog or download files. That network client and Brawl/Riivolution integration are separate implementation milestones.
