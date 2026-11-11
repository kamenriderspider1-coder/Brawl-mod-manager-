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

## 4. Start the local service

In Terminal, change into the backend folder. For example, if it is in Downloads:

```sh
cd ~/Downloads/Brawl-mod-manager-/backend
npm start
```

Leave that Terminal window open. The service listens only on `127.0.0.1:8787`, so it is not exposed to other devices on your Wi-Fi.

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
