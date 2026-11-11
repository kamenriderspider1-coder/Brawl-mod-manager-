#!/usr/bin/env python3
"""
brawl_cloud_sync.py - resolve, download, validate and upload approved Brawl mods
to a MEGA account through MEGAcmd.

For each catalog entry that has "downloadApproved": true:
  1. Find the archive link (see "Catalog fields" below).
  2. Download it with a size cap and a host allow-list. Redirects are checked too.
  3. Extract it. Zip is handled natively; .7z/.rar need a `7z` binary on PATH.
  4. Validate: no unsafe paths, no symlinks, no executable file types, not empty.
  5. Upload the files to "/Brawl Mods/<entry id>/" in the MEGA account that
     MEGAcmd is logged in to.

Credentials: this script never asks for or stores a MEGA password. Log in once
with the official MEGAcmd client (`mega-login you@example.com`). This script only
checks that a session exists.

Setup:
  - Python 3.9+ (standard library only)
  - MEGAcmd installed and logged in (https://mega.io/cmd)
  - Optional: 7z (7-Zip or p7zip) for .7z and .rar archives

Usage:
  python brawl_cloud_sync.py --catalog cloud-mods.json --dry-run
  python brawl_cloud_sync.py --catalog cloud-mods.json --only project-plus-all-stars

Catalog fields used (on each entry in "mods"):
  downloadApproved  REQUIRED true. Set it yourself after checking that the creator
                    page allows downloading this file.
  source            "gamebanana", "github-release", or anything else (treated as
                    an official page whose archive links are scraped).
  downloadUrl       Optional direct link. Skips all lookup.
  fileName          Optional name for downloadUrl (needed if the URL has no name).
  fileMatch         Optional regex that picks one archive when a source has several.

Re-running skips entries already marked "Uploaded" in brawl-cloud-work/state.json.
--force re-processes them. MEGA may then keep the older copies, so check for duplicates.
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser
import zipfile
from pathlib import Path

USER_AGENT = "BrawlCloudSync/1.0 (personal archive tool)"
TIMEOUT = 60
ARCHIVE_EXTS = (".zip", ".7z", ".rar")
BLOCKED_EXTS = {".exe", ".bat", ".cmd", ".com", ".scr", ".ps1", ".vbs", ".msi", ".sh", ".dll"}
# Every host a request may touch, including redirect targets. Subdomains match too.
ALLOWED_HOSTS = ("gamebanana.com", "github.com", "githubusercontent.com", "projectplusgame.com")
MAX_DOWNLOAD_BYTES = 2 * 1024**3
MEGA_ROOT = "/Brawl Mods"

# Status labels come from catalog downloadBehavior.statusLabels. "Uploaded" is an
# extra label for finished work. "Ready for Wii network access" is not used because
# the Wii bridge is not built yet.


# --------------------------------------------------------------------------- HTTP

def host_allowed(url, hosts=ALLOWED_HOSTS):
    parts = urllib.parse.urlsplit(url)
    host = (parts.hostname or "").lower()
    return parts.scheme == "https" and any(host == h or host.endswith("." + h) for h in hosts)


class _AllowlistedRedirects(urllib.request.HTTPRedirectHandler):
    """Refuse any redirect that leaves the allow-list."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not host_allowed(newurl):
            raise urllib.error.URLError(f"blocked redirect to {newurl}")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


_opener = urllib.request.build_opener(_AllowlistedRedirects)


def open_url(url, accept="*/*"):
    if not host_allowed(url):
        raise ValueError(f"host not on allow-list: {url}")
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": accept})
    return _opener.open(req, timeout=TIMEOUT)


def robots_allow(url):
    """True if robots.txt permits this UA to fetch url. Missing robots.txt means allowed."""
    parts = urllib.parse.urlsplit(url)
    rp = urllib.robotparser.RobotFileParser()
    try:
        with open_url(f"{parts.scheme}://{parts.netloc}/robots.txt", accept="text/plain") as resp:
            rp.parse(resp.read().decode("utf-8", "replace").splitlines())
    except urllib.error.HTTPError as err:
        return err.code == 404
    except Exception:
        return False  # unknown state: be conservative
    return rp.can_fetch(USER_AGENT, url)


# ----------------------------------------------------------------- link lookup

def _pick(items, entry, name_of):
    """Keep items whose name matches the optional fileMatch regex, then return the first."""
    pattern = entry.get("fileMatch")
    if pattern:
        items = [i for i in items if re.search(pattern, name_of(i) or "", re.IGNORECASE)]
    if not items:
        raise LookupError("no archive on the source matched this entry")
    return items[0]


def resolve_gamebanana(entry):
    match = re.search(r"gamebanana\.com/mods/(\d+)", entry["url"])
    if not match:
        raise ValueError("expected a https://gamebanana.com/mods/<id> URL")
    api = f"https://gamebanana.com/apiv11/Mod/{match.group(1)}?_csvProperties=_aFiles"
    with open_url(api, accept="application/json") as resp:
        data = json.load(resp)
    files = [
        f for f in data.get("_aFiles", [])
        if f.get("_sDownloadUrl") and (f.get("_sFile") or "").lower().endswith(ARCHIVE_EXTS)
    ]
    files.sort(key=lambda f: f.get("_tsDateAdded", 0), reverse=True)  # newest first
    chosen = _pick(files, entry, lambda f: f.get("_sFile"))
    return chosen["_sDownloadUrl"], chosen.get("_sFile")


def resolve_github_release(entry):
    match = re.search(r"github\.com/([^/]+)/([^/]+)/releases/tag/([^/?#]+)", entry["url"])
    if not match:
        raise ValueError("expected a https://github.com/<owner>/<repo>/releases/tag/<tag> URL")
    owner, repo, tag = match.groups()
    api = f"https://api.github.com/repos/{owner}/{repo}/releases/tags/{urllib.parse.quote(tag)}"
    with open_url(api, accept="application/vnd.github+json") as resp:
        release = json.load(resp)
    assets = [a for a in release.get("assets", []) if a["name"].lower().endswith(ARCHIVE_EXTS)]
    chosen = _pick(assets, entry, lambda a: a["name"])
    return chosen["browser_download_url"], chosen["name"]


def resolve_official_page(entry):
    page = entry["url"]
    if not robots_allow(page):
        raise PermissionError("robots.txt does not allow automated access; set downloadUrl in the catalog")
    with open_url(page, accept="text/html") as resp:
        html = resp.read(2_000_000).decode("utf-8", "replace")
    links = []
    for href in re.findall(r"""href=["']([^"'#]+)""", html, flags=re.IGNORECASE):
        absolute = urllib.parse.urljoin(page, href)
        path = urllib.parse.urlsplit(absolute).path.lower()
        if path.endswith(ARCHIVE_EXTS) and host_allowed(absolute) and absolute not in links:
            links.append(absolute)
    name_of = lambda u: os.path.basename(urllib.parse.urlsplit(u).path)
    chosen = _pick(links, entry, name_of)
    return chosen, name_of(chosen)


def resolve_download(entry):
    """Return (download_url, file_name) for a catalog entry."""
    if entry.get("downloadUrl"):
        url = entry["downloadUrl"]
        return url, entry.get("fileName") or os.path.basename(urllib.parse.urlsplit(url).path)
    source = entry.get("source")
    if source == "gamebanana":
        return resolve_gamebanana(entry)
    if source == "github-release":
        return resolve_github_release(entry)
    return resolve_official_page(entry)


# ------------------------------------------------------- download and extraction

def safe_filename(name):
    name = re.sub(r"[^A-Za-z0-9._ +()\-]", "_", os.path.basename(name or "")).strip(" .")
    if not name.lower().endswith(ARCHIVE_EXTS):
        raise ValueError(f"unsupported archive type: {name!r}")
    return name


def download(url, dest):
    """Stream url to dest. Returns (sha256 hex, bytes written)."""
    tmp = dest.with_name(dest.name + ".part")
    digest = hashlib.sha256()
    total = 0
    try:
        with open_url(url) as resp, open(tmp, "wb") as out:
            declared = int(resp.headers.get("Content-Length") or 0)
            if declared > MAX_DOWNLOAD_BYTES:
                raise ValueError(f"file is {declared} bytes, over the limit")
            while True:
                chunk = resp.read(256 * 1024)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_DOWNLOAD_BYTES:
                    raise ValueError("download exceeded the size limit")
                digest.update(chunk)
                out.write(chunk)
        tmp.replace(dest)
    finally:
        if tmp.exists():
            tmp.unlink()
    return digest.hexdigest(), total


def _inside(base, path):
    base = base.resolve()
    path = path.resolve()
    return path == base or base in path.parents


def extract(archive, dest):
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    if archive.suffix.lower() == ".zip":
        with zipfile.ZipFile(archive) as zf:
            for info in zf.infolist():  # check every member before writing anything
                if not _inside(dest, dest / info.filename):
                    raise ValueError(f"unsafe path in archive: {info.filename}")
            zf.extractall(dest)
    else:
        seven = shutil.which("7z") or shutil.which("7za")
        if not seven:
            raise RuntimeError(f"{archive.name} needs the 7z tool to extract (install 7-Zip or p7zip)")
        subprocess.run([seven, "x", "-y", f"-o{dest}", str(archive)], check=True, capture_output=True)
    for path in dest.rglob("*"):
        if path.is_symlink() or not _inside(dest, path):
            raise ValueError(f"unsafe link or path after extraction: {path.name}")


def validate(root):
    files = [p for p in root.rglob("*") if p.is_file()]
    if not files:
        raise ValueError("archive contains no files")
    blocked = sorted({p.name for p in files if p.suffix.lower() in BLOCKED_EXTS})
    if blocked:
        raise ValueError(f"archive contains blocked file types: {', '.join(blocked[:5])}")
    return files


# ------------------------------------------------------------------ MEGA upload

def _mega(cmd, *args, timeout=None):
    binary = shutil.which(f"mega-{cmd}")
    if not binary:
        raise RuntimeError(f"MEGAcmd is not installed or not on PATH (missing mega-{cmd})")
    return subprocess.run([binary, *args], capture_output=True, text=True, timeout=timeout)


def mega_account():
    result = _mega("whoami", timeout=30)
    text = (result.stdout + result.stderr).strip()
    if result.returncode != 0 or not text or "not logged in" in text.lower():
        raise RuntimeError(
            "Not logged in to MEGA (MEGAcmd said: "
            f"{text or 'no output'}). Run `mega-login you@example.com` in a terminal, then try again. "
            "This script never asks for your password."
        )
    return text.splitlines()[0]


def mega_mkdir(remote):
    _mega("mkdir", "-p", remote, timeout=120)  # -p: no error if it already exists


def mega_put(local, remote_dir):
    result = _mega("put", str(local), remote_dir + "/")
    if result.returncode != 0:
        raise RuntimeError(f"upload failed for {local.name}: {(result.stderr or result.stdout).strip()}")


def upload_tree(root, remote_base):
    mega_mkdir(remote_base)
    for d in sorted(p for p in root.rglob("*") if p.is_dir()):
        mega_mkdir(f"{remote_base}/{d.relative_to(root).as_posix()}")
    for f in sorted(p for p in root.rglob("*") if p.is_file()):
        rel = f.parent.relative_to(root).as_posix()
        mega_put(f, remote_base if rel == "." else f"{remote_base}/{rel}")


# -------------------------------------------------------------------- pipeline

def set_status(state, mod_id, label):
    state.setdefault(mod_id, {})["status"] = label
    print(f"[{mod_id}] {label}")


def process(entry, args, state, work):
    mod_id = entry["id"]
    if state.get(mod_id, {}).get("status") == "Uploaded" and not args.force:
        print(f"[{mod_id}] already uploaded, skipping")
        return

    set_status(state, mod_id, "Finding download")
    url, file_name = resolve_download(entry)
    if not host_allowed(url):
        raise ValueError(f"download host not on allow-list: {url}")
    print(f"[{mod_id}] download link: {url}")
    if args.dry_run:
        return

    mod_dir = work / mod_id
    mod_dir.mkdir(parents=True, exist_ok=True)
    archive = mod_dir / safe_filename(file_name)

    set_status(state, mod_id, "Downloading")
    sha256, size = download(url, archive)

    set_status(state, mod_id, "Extracting")
    extracted = mod_dir / "extracted"
    extract(archive, extracted)

    set_status(state, mod_id, "Validating")
    files = validate(extracted)

    set_status(state, mod_id, "Uploading to selected cloud account")
    remote = f"{MEGA_ROOT}/{mod_id}"
    upload_tree(extracted, remote)

    state[mod_id] = {
        "status": "Uploaded",
        "source_url": url,
        "sha256": sha256,
        "bytes": size,
        "files": len(files),
        "mega_path": remote,
    }
    shutil.rmtree(mod_dir, ignore_errors=True)  # local copies are no longer needed
    print(f"[{mod_id}] uploaded {len(files)} files to {remote}")


def main():
    parser = argparse.ArgumentParser(description="Download approved Brawl mods and upload them to MEGA.")
    parser.add_argument("--catalog", default="cloud-mods.json", help="path to cloud-mods.json")
    parser.add_argument("--work", default="brawl-cloud-work", help="scratch and state directory")
    parser.add_argument("--only", help="comma-separated mod ids to process")
    parser.add_argument("--dry-run", action="store_true", help="resolve download links only")
    parser.add_argument("--force", action="store_true", help="process entries already marked Uploaded")
    args = parser.parse_args()

    catalog = json.loads(Path(args.catalog).read_text(encoding="utf-8"))
    only = set(args.only.split(",")) if args.only else None
    work = Path(args.work)
    work.mkdir(parents=True, exist_ok=True)
    state_file = work / "state.json"
    state = json.loads(state_file.read_text(encoding="utf-8")) if state_file.exists() else {}

    if not args.dry_run:
        print(f"MEGA session: {mega_account()}")

    for entry in catalog.get("mods", []):
        mod_id = entry.get("id")
        if only and mod_id not in only:
            continue
        if not entry.get("downloadApproved"):
            print(f"[{mod_id}] skipped: set \"downloadApproved\": true after checking the creator page")
            continue
        if entry.get("status") != "Available":
            print(f"[{mod_id}] skipped: catalog status is {entry.get('status')!r}")
            continue
        try:
            process(entry, args, state, work)
        except Exception as err:  # record the failure and keep going
            set_status(state, mod_id, "Failed")
            state[mod_id]["error"] = str(err)
            print(f"[{mod_id}] failed: {err}")
        finally:
            if not args.dry_run:
                state_file.write_text(json.dumps(state, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
