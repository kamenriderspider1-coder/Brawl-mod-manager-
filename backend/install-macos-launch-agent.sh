#!/bin/bash
set -euo pipefail

LABEL="com.brawlmodmanager.local"
BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
NODE_BIN="$(command -v node || true)"

if [[ -z "$NODE_BIN" ]]; then
  echo "Node.js was not found. Install/enable Node.js 22 or newer, then run this script again."
  exit 1
fi

NODE_VERSION="$("$NODE_BIN" -p 'Number(process.versions.node.split(".")[0])')"
if [[ "$NODE_VERSION" -lt 22 ]]; then
  echo "Node.js 22 or newer is required. Found: $("$NODE_BIN" -v)"
  exit 1
fi

AGENT_DIR="$HOME/Library/LaunchAgents"
LOG_DIR="$HOME/Library/Logs/BrawlModManager"
PLIST="$AGENT_DIR/$LABEL.plist"
UID_NOW="$(id -u)"

escape_xml() {
  printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g'
}

NODE_XML="$(escape_xml "$NODE_BIN")"
BACKEND_XML="$(escape_xml "$BACKEND_DIR")"
SERVER_XML="$(escape_xml "$BACKEND_DIR/server.mjs")"
LOG_XML="$(escape_xml "$LOG_DIR")"

mkdir -p "$AGENT_DIR" "$LOG_DIR"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/caffeinate</string>
    <string>-i</string>
    <string>$NODE_XML</string>
    <string>$SERVER_XML</string>
  </array>
  <key>WorkingDirectory</key><string>$BACKEND_XML</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ProcessType</key><string>Background</string>
  <key>StandardOutPath</key><string>$LOG_XML/backend.log</string>
  <key>StandardErrorPath</key><string>$LOG_XML/backend-error.log</string>
  <key>EnvironmentVariables</key>
  <dict><key>PORT</key><string>8787</string></dict>
</dict>
</plist>
EOF

/usr/bin/plutil -lint "$PLIST"
launchctl bootout "gui/$UID_NOW/$LABEL" >/dev/null 2>&1 || true
launchctl enable "gui/$UID_NOW/$LABEL"
launchctl bootstrap "gui/$UID_NOW" "$PLIST"
launchctl kickstart -k "gui/$UID_NOW/$LABEL"

echo
echo "Brawl Mod Manager backend installed and started."
echo "It will start at your next login and relaunch if it exits."
echo "The Mac display may turn off; caffeinate prevents idle system sleep while the backend runs."
echo "Wi-Fi, router, DNS, firewall, and network settings were not changed."
echo "Backend is loopback-only at http://127.0.0.1:8787/health."
echo "Logs: $LOG_DIR"
