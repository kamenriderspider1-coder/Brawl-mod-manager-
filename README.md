# Brawl Mod Manager

A browser-first catalog for finding and organizing individual Super Smash Bros. Brawl mods.

## Current scope
- Search and filter a catalog by mod type.
- Keep source/download links attached to each entry.
- Record game region, required loader, and compatibility notes.
- Keep the catalog separate from large mod archives.

## Important Wii limitation
The catalog can be browsed online, but the Wii version of Brawl does not normally stream mod assets from cloud storage. For gameplay, selected files still need to be placed on the Wii's SD card or USB storage in the layout required by the mod and loader (for example, Riivolution). A future Wii companion can download supported files over the Wii's network connection, but it must be tested against Wii networking, file sizes, and each mod's install layout.

## Storage and permissions
This repository stores the app and catalog metadata, not a mirror of every community mod. Entries should link to the creator's official release or download page. Only host files when the author permits redistribution. Large files belong in an appropriate release or object-storage service, not in the catalog JSON.

## Run locally
Open `index.html` in a modern browser, or publish the repository with GitHub Pages.
