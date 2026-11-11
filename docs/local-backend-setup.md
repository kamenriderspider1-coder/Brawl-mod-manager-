# Mac companion backend

This is an **optional local companion service** for the GitHub Pages app. GitHub Actions now runs automated tests for the backend whenever its files change. Actions checks the code; it does **not** host a permanent server for your Mac or Wii.

## What works now

- A loopback-only health endpoint at `http://127.0.0.1:8787/health`.
- CORS restricted to this project's GitHub Pages origin.
- Browser preflight support, including the Private Network Access preflight header when requested.
- Automated Node.js tests, run by GitHub Actions.

## What is not implemented

MEGA or Google Drive sign-in, cloud browsing, mod searching, downloading, archive extraction, uploads, Wii/LAN file serving, and Wii streaming are not connected yet. The health check is only a connection test.

## Run locally on an approved Mac

Requirements: macOS and Node.js 22 or newer. If this is a school-managed Mac, use the service only if its administrator permits it. Do not bypass device restrictions.

1. Download the repository ZIP from GitHub and extract it.
2. Open Terminal in the extracted `backend` folder.
3. Check the available runtime:

   ```sh
   node -v
   npm -v
   ```

4. Start the service:

   ```sh
   npm start
   ```

5. Keep the Mac awake and connected to Wi-Fi while using this local service.
6. Open the GitHub Pages app and select **Check connection again**.

Stop it with Control+C in Terminal.

## Optional login startup

The `install-macos-launch-agent.sh` script installs a per-user LaunchAgent and uses `caffeinate -i` to prevent idle system sleep while the backend is running. This means the Mac must remain powered on and awake (the display may turn off). A Mac that is asleep or shut down cannot serve requests. Closing a MacBook lid may cause sleep.

Only run the installer if you have permission on the Mac. It writes a LaunchAgent and logs in your user account. It does not change Wi-Fi, router, DNS, firewall, or other network settings.

To remove the agent later:

```sh
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.brawlmodmanager.local.plist
rm ~/Library/LaunchAgents/com.brawlmodmanager.local.plist
```

## Security

The server listens only on `127.0.0.1` and rejects requests from origins other than this project's GitHub Pages origin. Do not change it to `0.0.0.0` or expose port 8787 to the internet. Never put MEGA passwords, session keys, OAuth secrets, or private mod archives in this public repository.

## GitHub-hosted execution

The workflow at `.github/workflows/backend-check.yml` runs tests on GitHub-hosted runners. These runners are temporary jobs, not an always-on backend. They cannot receive requests from the Pages app or keep serving files after a job ends. A cloud storage integration will need a separate hosted API/service and server-side secrets configured securely.
