# Brawl Mod Manager: Wii launcher + online catalog

## Correct intended experience
This is **not a separate game** and not a standalone game-like interface. The manager should appear as an app tile in the Homebrew Channel. When launched, it manages Brawl mod profiles and then starts the user's existing Super Smash Bros. Brawl game with the selected supported mod setup, similar in overall experience to a Brawl mod launcher.

The user should be able to:
- Open the manager from the Homebrew Channel.
- Connect to the internet and refresh a catalog hosted by this GitHub repository.
- Browse individual mods and compatible mod builds.
- Select a profile/build and download or update its authorized files to SD/USB.
- See installed items, storage use, update status, and compatibility notes.
- Launch Brawl with the selected mod configuration, rather than launching a separate custom game.

## Important distinction
The manager itself is a Wii homebrew launcher/manager. The actual gameplay remains Super Smash Bros. Brawl, using its normal game executable plus the selected mod's supported patching/loading method. The exact launch mechanism depends on the mod format: some Brawl builds use Gecko code loading and SD-card content folders, while others use Riivolution-style file replacement. These are not interchangeable; each catalog entry must declare its loader and required folder layout.

## Network and storage
- GitHub hosts the app source and catalog metadata.
- The Wii downloads selected mod files to SD/USB for gameplay.
- Brawl does not generally stream its mod assets directly from GitHub during a match.
- Prefer creator-provided download endpoints. Do not mirror archives unless redistribution is allowed.
- Verify archive integrity where checksums are published. Do not overwrite an installed profile without confirmation and a rollback plan.

## Implementation plan
1. Build the Homebrew Channel app shell and Wiimote navigation.
2. Add an online catalog client and connection/error handling.
3. Add per-entry loader metadata, source URLs, install paths, dependencies, and conflicts.
4. Implement safe download, integrity verification, profile management, and uninstall/rollback.
5. Implement the correct Brawl launch path for each supported loader.
6. Produce a compiled `.dol` and test in Dolphin and on the user's Wii.

## Technical constraint
Modern GitHub HTTPS endpoints may not be directly compatible with the Wii's networking/TLS stack. Prototype Wii networking first. If a relay is needed, restrict it to this project's catalog and explicitly approved download sources; do not build an arbitrary URL proxy.

## Build status
This document describes the intended product. It is not a compiled or tested Wii executable. A working Homebrew Channel app still requires C/C++ source, devkitPPC/libogc configuration, a compiled `.dol`, and testing on real hardware.
