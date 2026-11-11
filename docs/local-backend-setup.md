# Local backend setup

This first milestone connects the GitHub Pages interface to a small service running on your Mac. It deliberately exposes only a health check. It does not yet sign in to MEGA/Google Drive, download or extract mods, or serve files to the Wii.

## 1. Requirements

- macOS with Node.js 22 or newer (use an LTS release).
- Internet access to download the repository files.
- Keep this backend folder private on your Mac. Do not put account passwords, MEGA session data, OAuth secrets, or downloaded private files in GitHub.

Official Node.js downloads: https://nodejs.org/en/download/

## 2. Get the backend folder

Download this repository as a ZIP from GitHub, extract it, and open the extracted `backend` folder. You can also clone the repository if Git is already installed.

## 3. Check Node.js

Open Terminal and run:

```sh
node -v
npm -v
```

If Terminal says `command not found`, Node.js is not installed or is not on your PATH. Install an LTS version from the official Node.js site. If your Mac is managed and blocks installation, do not try to bypass that restriction; ask the device administrator for approval.

## 4. Install the background service on your M-series Mac

The repository includes an installer for Apple silicon Macs, including M2. It creates a per-user macOS LaunchAgent under `~/Library/LaunchAgents`. Apple's `launchd` is the supported macOS mechanism for managing background agents. The installer:

- Starts the backend when you log in.
- Restarts it if the process exits.
- Runs `caffeinate -i` while the backend is running, preventing idle system sleep while still allowing the display to turn off.
- Writes logs under `~/Library/Logs/BrawlModManager/`.

In Terminal, while inside the extracted `backend` folder, run:

```sh
bash install-macos-launch-agent.sh
```

If macOS reports that the script is not executable, run:

```sh
bash install-macos-launch-agent.sh
```

To check the service, run:

```sh
launchctl print gui/$(id -u)/com.brawlmodmanager.local
```

To stop and remove the background agent later:

```sh
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.brawlmodmanager.local.plist
rm ~/Library/LaunchAgents/com.brawlmodmanager.local.plist
```

The service starts after you log in, not before login at the macOS boot screen. It cannot run while the Mac is shut down or asleep. On a MacBook, closing the lid can still put the Mac to sleep; the installer does not change lid behavior or power settings.

**No network configuration is changed.** The installer does not alter Wi-Fi, router, DNS, firewall, or network settings. The backend stays bound to `127.0.0.1`, meaning only the Mac itself can connect to this first-stage service. Wii/LAN access is not enabled yet.

## 5. Connect the GitHub Pages app

Open:

https://kamenriderspider1-coder.github.io/Brawl-mod-manager-/

The Local backend status card should change to **Connected** when the app can reach `http://127.0.0.1:8787/health`.

If it says not connected:
- Confirm the Terminal window still shows the server is listening.
- Check that the address is exactly `http://127.0.0.1:8787/health`.
- Refresh the GitHub Pages app.
- If Safari reports a CORS or local-network permission error, tell me the exact message. Browser policies can differ.

## Security boundary

The service binds to loopback only and allows requests only from this project's GitHub Pages origin. Do not change the host to `0.0.0.0` or expose this port to the internet. The health endpoint is intentionally read-only. Before adding downloads, cloud sign-in, file writes, or Wii access, the next milestone must add request authentication, strict URL and file validation, safe archive extraction, and provider-specific secure session handling.
