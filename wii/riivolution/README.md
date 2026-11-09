# Riivolution integration notes

This project is a companion profile manager, not a fork or replacement of Riivolution. The goal is to prepare and select profiles that Riivolution can load.

RiiFS is not generic HTTPS, iCloud Drive, Google Drive, or SMB. A server must implement the RiiFS protocol and be reachable from the Wii. Do not put credentials or private tokens in public XML or GitHub files.

A minimal patch XML must be authored against the exact game ID, region, and replacement paths of a legally obtained Brawl copy. Keep real mod payloads out of this repository unless their creators explicitly permit redistribution.

No production patch XML is included yet. Validate the current Riivolution network specification before implementing the profile writer: https://riivolution.github.io/wiki/Network/
