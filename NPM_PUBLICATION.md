# Publishing BlockDoc to npm

This document provides instructions for publishing the BlockDoc package to npm.

## Prerequisites

- npm account with access to publish to the `blockdoc` package name
- Two-factor authentication (2FA) set up for your npm account
- Authenticator app accessible to generate one-time passwords (OTP)

## Publication Steps

1. Ensure all tests pass and the build is successful:

```bash
npm run lint && npm test && npm run build
```

2. Create a tarball for local testing:

```bash
npm pack
```

3. Test the package locally (in a separate test project):

```bash
# In a test project directory
npm install /path/to/blockdoc-1.0.0.tgz
```

4. Publish to npm with OTP:

```bash
# Get the OTP from your authenticator app
npm publish --otp=YOUR_OTP_CODE
```

5. Verify the package is published:

```bash
npm view blockdoc
```

6. Push git tags to GitHub:

```bash
git push origin v1.0.0
```

7. Create a GitHub release based on the tag (can be done through the GitHub web interface).

## If OTP Fails

If the OTP code fails or times out:

1. Generate a new OTP from your authenticator app
2. Try publishing again with the new OTP:

```bash
npm publish --otp=NEW_OTP_CODE
```

## Post-Publication

After successful publication:

1. Update the main README.md with installation instructions pointing to the npm package
2. Share the package with potential users
3. Consider setting up badges for npm version, license, and build status on the README

## Future Releases

For future releases:

1. Update the version in package.json
2. Update any relevant documentation
3. Run tests and build
4. Create a git tag for the new version
5. Publish to npm following the steps above