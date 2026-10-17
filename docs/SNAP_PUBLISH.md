# Publishing to Snap Store from Windows with GitHub Actions

1. Create a developer account: https://snapcraft.io/account
2. Register a unique snap name: https://dashboard.snapcraft.io/register-snap/
3. The configured package name is `tamoveer`; register that exact name if it is available.
   If taken, select a permitted replacement and update package/metadata consistently.
4. Commit and push this project to your own GitHub repository.
5. In Actions > **Build Linux + macOS** > Run workflow, download the Linux
   artifact and confirm your `.snap` installs and starts on a Linux environment.
6. Obtain restricted Snapcraft login credentials (`snapcraft export-login
   --snaps tamoveer --acls package_access,package_push,package_update,package_release -`)
   from a Snapcraft CLI session. A Linux VM/WSL or another supported environment
   can be used for initial authentication; builds and uploads then run on GitHub.
7. In GitHub Settings > Secrets and variables > Actions, add repository secret
   `SNAPCRAFT_STORE_CREDENTIALS` with the exact exported credentials text.
8. In Actions, manually run **Publish Snap Store**. It builds the Snap on Ubuntu,
   verifies credentials and uploads it to the **stable** channel.
9. Store automated checks and reviews must pass; confirm the listing and install
   from Snap Store on a Linux PC.

CAUTION: Running the Publish workflow submits your package to a public store.
Use a unique package name you own and review rights and permissions first.

References:
- https://snapcraft.io/docs/releasing-your-app/
- https://snapcraft.io/docs/snapcraft-authentication/
