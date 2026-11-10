# Brawl Mod Manager + Brawl Cloud

This repository contains two separate pieces:

1. **Brawl Cloud**: a public, repository-backed mod catalog and file library.
2. **Wii Mod Manager**: a separate Homebrew Channel manager prototype. Its downloadable package belongs in GitHub Releases.

## Brawl Cloud

- Website entry point: `index.html`
- Public mod catalog: `cloud-library/catalog.json`
- Mod files you are allowed to redistribute: `cloud-library/files/`
- The website reads the catalog and provides links to the permitted files or creators' official pages.
- Mod archives are **not** published as GitHub Release assets.

This is a public static library, not private or unlimited storage. GitHub repository file hosting has practical file and repository-size limits. A secure upload form cannot safely store a GitHub access token in public browser code, so this version is read-only for visitors. To add a file, add it to `cloud-library/files/` and add its metadata to `cloud-library/catalog.json` in the repository.

Only add files you created or that their authors explicitly permit you to redistribute. For other mods, list the creator's official page instead of mirroring the file.

## Publishing the Brawl Cloud website

The `.github/workflows/deploy-pages.yml` workflow publishes the static site with GitHub Pages. In repository Settings → Pages, choose **GitHub Actions** as the source if it is not already selected. GitHub's official guide describes this deployment setup: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Wii Mod Manager Releases

The `.github/workflows/build-wii.yml` workflow is separate. When its build succeeds, it publishes only the Wii manager package:

- `boot.dol`
- `meta.xml`
- `brawl-mod-manager-wii.zip`

No cloud-library website files or mod archives are attached to these releases. The Releases page is: https://github.com/kamenriderspider1-coder/Brawl-mod-manager-/releases

## Important Wii compatibility boundary

The current native Wii app is a profile-menu prototype. It does not yet fetch the cloud catalog, download mod files, hook Brawl's file access, or load network mods inside the game. A static cloud library and a Wii Homebrew Channel menu do not automatically create a working network mod loader. That end-to-end loader still needs to be implemented and tested on Dolphin and a real Wii.

## Legacy Cloudflare code

The old `cloud/worker/` folder is a legacy experiment and is not part of the current Brawl Cloud website or Wii release workflow. It requires Cloudflare R2, which was not enabled on the connected account.
