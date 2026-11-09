# Cloud profile format

The manager's cloud catalog describes **where a mod is hosted** and **which Wii loader profile is expected**. It does not mirror copyrighted mod archives.

## Why RiiFS
Riivolution has a documented `<network protocol="riifs" address="..." port="1137" />` element. With a compatible RiiFS server, patch files can be read over the Wii network. This is not a direct iCloud Drive, Google Drive, or generic HTTPS integration. A RiiFS-compatible server must expose the mod folder.

## Files in this folder
- `catalog.schema.json`: validation rules for cloud profile metadata.
- `catalog.example.json`: deliberately non-working placeholder profile.

## Security and publishing rules
- Never put passwords, access tokens, or private credentials in this public repository.
- Do not expose an unauthenticated writable file server to the public internet.
- Use only mod files that the creator permits you to host; otherwise store metadata and link to the creator's official page.
- The example host and download URL are placeholders, not live services.

## Wii launch compatibility
Riivolution's own documentation describes retail-disc patching and says USB loaders are not supported. RiftWii is a separate project whose guide documents RiiFS network packs and a local launch cache. That may be a better path to test with a USB game library, but it is not a zero-local-storage guarantee. The manager should not label a profile as compatible until tested on the target Wii and loader.

## Current status
This folder defines a data format only. No cloud host, account system, RiiFS server, Wii executable, or end-to-end Brawl profile has been deployed or tested.
