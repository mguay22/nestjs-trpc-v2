# Release Guide

Quick reference guide for creating releases of nestjs-trpc-v2.

## Quick Release Steps

```bash
# 1. Ensure you're on main and up to date
git checkout main
git pull origin main

# 2. Update version (choose one)
cd packages/nestjs-trpc-v2
npm version patch    # 0.0.6 → 0.0.7 (bug fixes)
npm version minor    # 0.0.6 → 0.1.0 (new features)
npm version major    # 0.0.6 → 1.0.0 (breaking changes)

# 3. Go back to root and commit
cd ../..
git add packages/nestjs-trpc-v2/package.json
git commit -m "chore: release v0.0.7"

# 4. Create and push tag
git tag v0.0.7
git push origin main
git push origin v0.0.7

# 5. Wait for automated workflows to complete
# - GitHub Release will be created automatically
# - Package will be published to npm automatically
```

## Understanding GitHub Releases vs npm Packages

### GitHub Releases

**Purpose**: Version tracking and changelog for your repository

**What they provide**:
- Visible on your repository's "Releases" page
- Changelog/release notes for each version
- Downloadable source code snapshots (zip/tar.gz)
- Attach binary assets if needed
- Track version history of your project

**Use cases**:
- Announce new versions to users
- Provide detailed changelogs
- Distribute standalone binaries or assets
- Link to documentation for that version

**Example**: https://github.com/mguay22/nestjs-trpc-v2/releases

### npm Packages

**Purpose**: Distribution of installable JavaScript packages

**What they provide**:
- Installable via `npm install nestjs-trpc-v2`
- Version management through package.json
- Dependency resolution
- Package discovery on npmjs.com

**Use cases**:
- Distribute your library to developers
- Enable easy installation via package managers
- Manage dependencies and versions

**Example**: https://npmjs.com/package/nestjs-trpc-v2

### GitHub Packages

**Purpose**: Alternative package registry hosted by GitHub

**What it provides**:
- Similar to npm, but hosted on GitHub
- Integrated with GitHub permissions and authentication
- Can host npm, Docker, Maven, NuGet, and more
- Free for public repositories

**Use cases**:
- Keep everything in GitHub ecosystem
- Use GitHub permissions for private packages
- Multi-format package hosting (npm + Docker + etc)

**How it differs from npm**:
- npm: Public, widely used, standard for JavaScript
- GitHub Packages: GitHub-integrated, good for organizations using GitHub exclusively

**Example**: `https://npm.pkg.github.com/@mguay22/nestjs-trpc-v2`

## Current Setup

Your repository is configured to:

✅ **GitHub Releases**: Auto-created when you push a version tag
✅ **npm Packages**: Auto-published to npmjs.com when you push a version tag
❌ **GitHub Packages**: Not currently configured (optional)

## Workflow Overview

```
┌─────────────────────────────────────────────────────────┐
│  Developer pushes version tag (e.g., v0.0.7)            │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
┌──────────────────┐  ┌──────────────────────┐
│  release.yml     │  │   publish.yml        │
│  workflow        │  │   workflow           │
└────────┬─────────┘  └──────────┬───────────┘
         │                       │
         │                       │
         ▼                       ▼
┌──────────────────┐  ┌──────────────────────┐
│ GitHub Release   │  │  npm Registry        │
│ - Changelog      │  │  - Installable pkg   │
│ - Source code    │  │  - Version published │
│ - Release notes  │  │                      │
└──────────────────┘  └──────────────────────┘
```

## Tips

1. **Always test locally first**: Run `pnpm build && pnpm test` before creating a release
2. **Follow semver**: Use semantic versioning (MAJOR.MINOR.PATCH)
3. **Write good commit messages**: They become your changelog
4. **Pre-releases for testing**: Use `-beta`, `-alpha` suffixes for pre-release versions
5. **Check workflows**: Monitor GitHub Actions to ensure workflows complete successfully

## Troubleshooting

### Workflow fails
- Check GitHub Actions logs: `https://github.com/mguay22/nestjs-trpc-v2/actions`
- Ensure `NPM_TOKEN` secret is configured in repository settings
- Verify tests pass locally before releasing

### Version already exists on npm
- You cannot republish the same version
- Delete the tag: `git tag -d vX.X.X && git push origin :vX.X.X`
- Increment version and try again

### Need to update a release
- You can edit GitHub Releases manually after creation
- Cannot update npm package once published (must publish new version)

## Additional Resources

- [Semantic Versioning](https://semver.org/)
- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [npm Publishing Documentation](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [GitHub Packages Documentation](https://docs.github.com/en/packages)
