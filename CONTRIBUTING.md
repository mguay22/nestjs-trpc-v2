# Contributing to nestjs-trpc-v2

Thank you for your interest in contributing to nestjs-trpc-v2! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9.0.0
- Git

### Setup Development Environment

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/mguay22/nestjs-trpc-v2.git
   cd nestjs-trpc-v2
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Build the project:

   ```bash
   pnpm build
   ```

5. Run tests:
   ```bash
   pnpm test
   ```

## Development Workflow

### Creating a Branch

Create a new branch for your feature or bugfix:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Making Changes

1. Make your changes in the appropriate package under `packages/nestjs-trpc`
2. Add tests for your changes
3. Ensure all tests pass: `pnpm test`
4. Ensure the build succeeds: `pnpm build`
5. Format your code: `pnpm format`

### Commit Messages

We follow conventional commits. Your commit messages should follow this format:

```
type(scope): subject

body

footer
```

Types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

Examples:

```
feat(decorators): add new @Subscription decorator
fix(router): resolve type inference issue
docs(readme): update installation instructions
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter nestjs-trpc-v2 build
```

## Submitting a Pull Request

1. Push your changes to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request from your fork to the main repository
3. Fill out the PR template with all relevant information
4. Wait for review and address any feedback

### PR Requirements

- All tests must pass
- Code must be formatted with Prettier
- New features should include tests
- Documentation should be updated if needed
- The build must succeed

## Code Style

- We use Prettier for code formatting
- We use ESLint for linting
- TypeScript strict mode is enabled
- Follow existing code patterns in the project

## Project Structure

```
nestjs-trpc-v2/
├── packages/
│   └── nestjs-trpc/
│       ├── lib/              # Source code
│       │   ├── decorators/   # Decorators
│       │   ├── factories/    # Factories
│       │   ├── generators/   # Code generators
│       │   ├── interfaces/   # TypeScript interfaces
│       │   └── ...
│       ├── dist/             # Build output
│       └── package.json
├── .github/                  # GitHub configuration
├── turbo.json               # Turborepo config
└── package.json             # Root package.json
```

## Reporting Bugs

Please use the GitHub issue tracker to report bugs. Include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Code samples if applicable
- Environment details (OS, Node version, etc.)

## Requesting Features

Feature requests are welcome! Please:

- Use the GitHub issue tracker
- Clearly describe the feature and its use case
- Explain why this feature would be useful
- Provide code examples if possible

## Publishing

### Release Process

This project uses GitHub Releases and automated publishing to npm. Here's how to create a new release:

#### Prerequisites

Before publishing, ensure you have:

1. **NPM Access**: You need to be added as a maintainer on npm (contact the project owner)
2. **NPM Token**: The repository needs an `NPM_TOKEN` secret configured in GitHub Actions
3. **All Changes Merged**: Ensure all desired changes are merged to `main` branch
4. **Tests Passing**: Verify that all CI checks pass on `main`

#### Steps to Create a Release

1. **Update the version** in `packages/nestjs-trpc-v2/package.json`:

   ```bash
   cd packages/nestjs-trpc-v2

   # For patch releases (0.0.6 → 0.0.7)
   npm version patch

   # For minor releases (0.0.6 → 0.1.0)
   npm version minor

   # For major releases (0.0.6 → 1.0.0)
   npm version major
   ```

2. **Commit the version change**:

   ```bash
   git add packages/nestjs-trpc-v2/package.json
   git commit -m "chore: bump version to vX.X.X"
   ```

3. **Create and push a git tag**:

   ```bash
   # The tag should match the version in package.json
   git tag v0.0.7
   git push origin main
   git push origin v0.0.7
   ```

4. **Automated Process**:
   - The `release.yml` workflow will automatically trigger
   - It will create a GitHub Release with auto-generated changelog
   - The `publish.yml` workflow will publish the package to npm
   - Both workflows run tests before publishing

#### What Happens During a Release

When you push a version tag (e.g., `v0.0.7`):

1. **GitHub Release Creation** (`release.yml`):
   - Generates a changelog from commits since the last tag
   - Creates a GitHub Release with the changelog
   - Marks pre-releases (e.g., `v0.1.0-beta.1`) appropriately

2. **NPM Publishing** (`publish.yml`):
   - Installs dependencies
   - Builds the package
   - Runs all tests (unit + e2e)
   - Publishes to npm registry

#### Version Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.0.x): Bug fixes, documentation updates, internal changes
- **Minor** (0.x.0): New features, non-breaking changes
- **Major** (x.0.0): Breaking changes, major API changes

#### Pre-releases

For beta or alpha releases:

```bash
# Create a pre-release version
npm version prerelease --preid=beta

# Example: 0.0.6 → 0.0.7-beta.0
git tag v0.0.7-beta.0
git push origin main
git push origin v0.0.7-beta.0
```

Pre-releases are automatically marked in GitHub Releases.

#### Manual Publishing (Emergency Only)

If automated publishing fails, you can manually publish:

```bash
# Build the package
pnpm build

# Navigate to package directory
cd packages/nestjs-trpc-v2

# Login to npm (if not already)
npm login

# Publish
npm publish --access public
```

### GitHub Packages

Currently, the project publishes to npm only. To also publish to GitHub Packages, the `publish.yml` workflow would need to be extended with an additional job.

## Questions?

If you have questions, please:

- Check existing issues and discussions
- Create a new discussion on GitHub
- Reach out to the maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Code of Conduct

Please be respectful and constructive in all interactions. We're all here to build something great together!
