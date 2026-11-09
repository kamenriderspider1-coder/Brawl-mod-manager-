# Brawl Mod Manager: network-storage launcher + catalog

## Intended experience
This is **not a separate game**. The manager appears in the Homebrew Channel, lets the user browse Brawl mods, and launches the user's existing Super Smash Bros. Brawl with the selected supported mod setup.

The user's storage goal is a **network drive**: mod archives and extracted mod files stay on a network-accessible storage device or server, rather than being copied permanently onto the Wii SD card, Wii USB drive, iPhone, or Google Drive. The Wii accesses the shared files over Wi-Fi, much like a network-attached hard drive.

## Target workflow
1. Launch the manager from the Homebrew Channel.
2. Connect to the home network and the configured network share.
3. Browse the online catalog hosted by this repository.
4. Select a mod profile stored on the network share.
5. Start Brawl through the compatible mod-loading method.
6. Where technically supported, the loader reads mod files from the network share as Brawl requests them.

## Network storage: important distinction
- A NAS or computer shared folder on the **same home network** can expose files over SMB. Wii homebrew has existing SMB client support through libogc/tinysmb, and other Wii homebrew apps have browsed or read SMB shares.
- A cloud service over the public internet is not automatically the same as a local SMB network drive. Internet access, authentication, TLS, and latency require separate engineering.
- SMB support inside the manager does **not** automatically mean Brawl or an existing mod loader can read every asset over SMB.
- Riivolution's documented workflow uses replacement files on SD/USB. To achieve true network-backed gameplay, the project must integrate a network filesystem into the actual file-replacement/loading path, or implement a compatible loader/redirector.
- Some loaders or mods may require local files, may load assets too early for network access, or may not tolerate network latency. Those combinations must be marked unsupported rather than promised.

## Storage design
- GitHub stores app source and catalog metadata, not the large mod archive collection.
- A network share/NAS stores the user's mod files. The manager reads them over SMB when supported.
- The manager should cache only small catalog/index metadata in local app settings. Do not silently copy full mod archives onto SD/USB.
- If a specific loader requires local staging, explain that limitation before the user selects that mod. Do not claim zero local storage for unsupported formats.
- Prefer creator-provided download endpoints. Do not mirror archives unless redistribution is allowed.
- Verify published checksums and preserve a safe rollback path when changing profiles.

## Implementation plan
1. Build the Homebrew Channel app shell and Wiimote navigation.
2. Prototype SMB connection and directory browsing using Wii-compatible networking.
3. Define a catalog manifest with loader type, source, network path, game region/version, dependencies, and conflicts.
4. Test whether the selected Brawl loader can read replacement assets through the SMB filesystem during gameplay.
5. If the loader cannot, investigate a compatible file-access redirector or clearly document the local-staging requirement.
6. Add profile selection, connection/error handling, and safe file management.
7. Produce a compiled `.dol` and test in Dolphin and on real Wii hardware.

## Technical references
- WiiBrew documents tinysmb/SMB support in libogc: https://wiibrew.org/wiki/Tinysmb
- WiiBrew documents Riivolution's SD/USB replacement-file workflow: https://www.wiibrew.org/wiki/Riivolution
- WiiBrew documents WiiXplorer browsing SMB shares: https://www.wiibrew.org/wiki/WiiXplorer

## Build status
This document describes the intended product. It is not a compiled or tested Wii executable. A working Homebrew Channel app still requires C/C++ source, devkitPPC/libogc configuration, a compiled `.dol`, and real-hardware testing. Network-backed Brawl asset loading remains a research/prototype milestone, not a confirmed capability.
