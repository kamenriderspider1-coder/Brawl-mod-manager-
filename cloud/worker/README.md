# Retired: Cloudflare R2 worker

This Worker is **not part of the current Brawl Cloud storage design** and is not required to run the website.

The project now uses the connected user's own Google Drive directly for Brawl Cloud files and its catalog. No Cloudflare account, R2 bucket, Worker deployment, or Worker secret is needed for web storage.

This folder is retained only as historical code. Do not deploy it or configure it as a second storage location. The Wii app still needs its own secure Google Drive connection implemented; it cannot reuse the browser's private OAuth session automatically.
