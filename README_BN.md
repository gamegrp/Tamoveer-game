# Tamoveer — Linux + MacBook Desktop Game

**Developer:** Nitai Studio  
**Support:** nitai.grp00@gmail.com  
**App name:** Tamoveer  
**Desktop App ID:** `com.tamoveer.nitaistudio`  
**npm / Snap package name:** `tamoveer` *(Snap Store registration/availability has not been checked)*

## Included game

`web/index.html`, `web/manifest.webmanifest`, `web/sw.js`, and `web/icons/` were copied from your uploaded **tamoveer-pwa.zip**. This is the original Tamoveer HTML5 game — not the placeholder notes demo. Desktop builds bundle the files and work offline without a server/Firebase. The existing game code was retained.

## Windows 10 PC: preview

1. Install [Node.js LTS](https://nodejs.org/) and [VS Code](https://code.visualstudio.com/).
2. Extract this ZIP and open the **Tamoveer-Desktop-Linux-macOS** folder.
3. Double-click `START-WINDOWS.bat`, or open a VS Code terminal and run:

```powershell
npm install
npm run check
npm start
```

The above commands are for **desktop preview on Windows**, not for directly creating Linux/macOS installers on Windows.

## Build Linux and MacBook installers in GitHub Actions

1. Create a new GitHub repo for Tamoveer; upload all project files (including the hidden `.github` directory). Do **not** upload `node_modules/` or `dist/`.
2. Open **Actions** → **Build Linux + macOS** → **Run workflow**. You can also push to the `main` branch to trigger a build.
3. Wait for both build jobs to complete. Download the **Linux-x64** and **macOS-Intel-AppleSilicon-UNSIGNED** artifacts from the workflow run.
4. The Linux workflow targets `.AppImage`, `.deb` and `.snap` (x64). The macOS workflow targets `.dmg` and `.zip` for Intel x64 and Apple Silicon arm64 Macs.
5. Test the resulting installers on a real Linux system and a real Mac before release. Build outcomes depend on dependencies and the CI environment; this ZIP is **source code**, not finished binaries.

### npm commands

```powershell
npm run check
npm start
npm run build:linux  # run on Linux CI
npm run build:mac    # run on macOS CI
```

## Publishing

- **Snap Store:** See `docs/SNAP_PUBLISH.md`. Register the available name `tamoveer` first, configure `SNAPCRAFT_STORE_CREDENTIALS` only after registration, and review the publish workflow carefully before running it. Availability/approval are not guaranteed.
- **Direct Linux downloads:** Add the `.AppImage` / `.deb` to a GitHub Release after testing.
- **Mac direct downloads:** Current `.dmg` / `.zip` builds are **unsigned**. Apple Developer ID signing and Apple notarization are needed for standard end-user distribution without warnings.
- **Mac App Store:** A `.dmg` cannot be submitted directly. It needs a separate `mas` build, entitlements/sandbox/signing, Apple Developer membership and App Review. See `docs/MAC_PUBLISH.md`.
- Flathub needs a separately prepared Flatpak package; it is not produced by this workflow.

## Notes

- The desktop game uses a secure `pwaapp://bundle` origin with Electron Node integration disabled. Game resources are packaged, so the PWA service worker is not needed to make desktop play offline.
- Original PWA project includes a Firebase deployment configuration, but Electron uses only local game resources; no Firebase backend is configured.
- Update the version in `package.json` for future desktop releases.
- Do not expose private signing keys or store login credentials in your repository.
- This project has configuration/source validation, but no verified macOS/Linux installer build has been completed in this environment.
