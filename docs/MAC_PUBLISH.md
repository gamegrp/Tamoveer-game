# macOS distribution and Mac App Store

The included GitHub Actions workflow produces **unsigned** `.dmg` and `.zip`
packages for Intel (x64) and Apple Silicon (arm64) Macs. You can build them
on a GitHub-hosted macOS runner even if your own PC runs Windows.

## Important difference

- **GitHub/direct download**: use a DMG signed with **Developer ID Application**
  and notarized by Apple for smooth Gatekeeper-approved installation.
- **Mac App Store**: requires Apple's **Mac App Distribution** signing,
  sandboxing, appropriate entitlements/provisioning, a **`mas`** build target,
  App Store Connect setup and Apple review. A `dmg` is NOT uploaded to the Mac App Store.
- Both normally require Apple Developer Program membership and credentials;
  Apple's membership has a fee. A bare wrapper may not pass store review.

## Preparing signed direct distribution

1. Enroll in Apple Developer Program and get your Developer ID Application certificate.
2. Export the certificate as a password-protected `.p12`.
3. Store it in GitHub secrets as `CSC_LINK` (base64 of `.p12`) and
   `CSC_KEY_PASSWORD`; configure `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and
   `APPLE_TEAM_ID` (or appropriate App Store Connect credentials).
4. **Remove `"identity": null`** from `build.mac` in `package.json` so signing
   is not explicitly disabled.
5. Set `"notarize": true` in `build.mac`; verify current electron-builder
   instructions and provide the signing/notarization env variables to the macOS
   build step. Do **not** set `CSC_IDENTITY_AUTO_DISCOVERY=false` for that step.
6. Test the signed, notarized DMG on a real Mac before publication.

The Tamoveer desktop project does not automatically request certificates or publish to App Store
Connect. Apple Store submission requires separate configuration and review.

References:
- https://www.electron.build/v26/docs/mac/
- https://www.electron.build/v26/docs/notarization/
- https://developer.apple.com/macos/distribution/
