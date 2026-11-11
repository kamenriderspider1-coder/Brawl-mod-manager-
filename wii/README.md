# Brawl Mod Manager for Wii

## Test build

GitHub Actions builds the Homebrew Channel app without requiring devkitPro on your Mac.

1. Open the repository's **Actions** tab.
2. Open **Build Wii Mod Manager and Publish Release** and wait for the run to finish successfully.
3. Open the generated GitHub Release and download `brawl-mod-manager-wii.zip`.
4. Extract the ZIP. Copy the included `brawl-mod-manager` folder into the root of your Wii SD card so the app is at:
   `sd:/apps/brawl-mod-manager/boot.dol`
5. Put test folders and files inside `sd:/brawl-mods/`.
6. Launch **Brawl Mod Manager** from the Homebrew Channel.

## Controls

- D-pad: move selection
- A: enter a folder, or show selected file information
- B: go up one folder; at the root, rescan the SD card
- HOME (Wii Remote) or START (GameCube controller): return to the Wii menu

The app creates `sd:/brawl-mods/` if it does not already exist. It can browse nested folders and show file sizes.

## What this test build does not do

This is a real Wii homebrew test build, but it is not yet the complete cloud mod manager. It does **not** connect to MEGA or Google Drive, download files over Wi-Fi, install or activate mods, generate Riivolution patches, or launch Brawl with a selected mod. The current purpose is to test the Wii app's SD-card browser and controller navigation.

Your existing REX installation is not modified. Keep it in place and test this app separately.
