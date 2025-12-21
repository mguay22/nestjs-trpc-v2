<a href="https://nestjs-trpc-v2.io/" target="_blank" rel="noopener">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://i.imgur.com/JvsOXCg.png" />
    <img alt="tRPC" src="https://i.imgur.com/JvsOXCg.png" />
  </picture>
</a>

<div align="center">
  <h1>nestjs-trpc-v2</h1>
  <h3>A maintained fork of nestjs-trpc<br />An opinionated approach to building End-to-end typesafe APIs with tRPC within NestJS.</h3>
  <a href="https://github.com/mguay22/nestjs-trpc-v2/actions/workflows/ci.yml">
    <img alt="CI" src="https://github.com/mguay22/nestjs-trpc-v2/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://www.npmjs.com/package/nestjs-trpc-v2">
    <img alt="npm version" src="https://badge.fury.io/js/nestjs-trpc-v2.svg" />
  </a>
  <a href="https://www.npmjs.com/package/nestjs-trpc-v2">
    <img alt="weekly downloads" src="https://img.shields.io/npm/dm/nestjs-trpc-v2.svg">
  </a>
  <a href="https://github.com/mguay22/nestjs-trpc-v2/blob/main/LICENSE">
    <img alt="MIT License" src="https://img.shields.io/github/license/mguay22/nestjs-trpc-v2" />
  </a>
  <br />
  <figure>
    <img src="https://i.imgur.com/bttfbmF.gif" alt="Demo" />
    <figcaption>
      <p align="center">
        The client above is <strong>not</strong> importing any code from the server, only its type declarations.
      </p>
    </figcaption>
  </figure>
</div>

---

> **⚠️ Important Notice**: This is a maintained fork of the original [nestjs-trpc](https://github.com/KevinEdry/nestjs-trpc) by [Kevin Edry](https://twitter.com/KevinEdry). The original repository is no longer actively maintained. This fork continues development with modern tooling, updated dependencies, and ongoing support.

---

## Introduction

**nestjs-trpc-v2** is a library designed to integrate the capabilities of tRPC into the NestJS framework. It provides native support for decorators and implements an opinionated approach that aligns with NestJS conventions.

This v2 fork includes:

- 🔄 Active maintenance and updates
- 📦 Turborepo monorepo structure
- 🚀 Modern build tooling
- 🔒 Updated dependencies with security patches
- ✅ Automated CI/CD workflows

## Features

- ✅&nbsp; Supports most tRPC features out of the box with more to come.
- 🧙‍&nbsp; Full static typesafety & autocompletion on the client, for inputs, outputs, and errors.
- 🙀&nbsp; Implements the Nestjs opinionated approach to how tRPC works.
- ⚡️&nbsp; Same client-side DX - We generate the AppRouter on the fly.
- 🔋&nbsp; Examples are available in the ./examples folder.
- 📦&nbsp; Out of the box support for **Dependency Injection** within the routes and procedures.
- 👀&nbsp; Native support for `express`, `fastify`, and `zod` with more drivers to come!

## Quickstart

### Installation

To install **nestjs-trpc-v2** with your preferred package manager, you can use any of the following commands:

```shell
# npm
npm install nestjs-trpc-v2 zod @trpc/server

# pnpm
pnpm add nestjs-trpc-v2 zod @trpc/server

# yarn
yarn add nestjs-trpc-v2 zod @trpc/server
```

### Peer Dependencies

Make sure you have the following peer dependencies installed:

- `@nestjs/common` (^9.3.8 || ^10.0.0)
- `@nestjs/core` (^9.3.8 || ^10.0.0)
- `@trpc/server` (^10.0.0)
- `reflect-metadata` (^0.1.13 || ^0.2.0)
- `rxjs` (7.8.1)
- `zod` (^3.14.0)

## How to use

Here's a brief example demonstrating how to use the decorators available in **nestjs-trpc-v2**:

```typescript
// users.router.ts
import { Inject } from '@nestjs/common';
import { Router, Query, UseMiddlewares } from 'nestjs-trpc-v2';
import { UserService } from './user.service';
import { ProtectedMiddleware } from './protected.middleware';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string(),
  password: z.string(),
});

@Router()
class UserRouter {
  constructor(@Inject(UserService) private readonly userService: UserService) {}

  @UseMiddlewares(ProtectedMiddleware)
  @Query({ output: z.array(userSchema) })
  async getUsers() {
    try {
      return this.userService.getUsers();
    } catch (error: unknown) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error has occured when trying to get users.',
        cause: error,
      });
    }
  }
}
```

**👉 For more examples and detailed documentation, see [NestJS-tRPC.io](https://nestjs-trpc-v2.io/docs). 👈**

> **Note**: The original documentation site is maintained by Kevin Edry. This fork maintains API compatibility with the original library.

## Development

This project uses Turborepo for managing the monorepo.

### Prerequisites

- Node.js >= 18
- pnpm >= 9.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/mguay22/nestjs-trpc-v2.git
cd nestjs-trpc-v2

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Project Structure

```
nestjs-trpc-v2/
├── packages/
│   └── nestjs-trpc/           # Main package
│       ├── lib/               # Source code
│       │   ├── decorators/    # Decorators
│       │   ├── factories/     # Factories
│       │   ├── generators/    # Code generators
│       │   ├── interfaces/    # TypeScript interfaces
│       │   └── ...
│       └── dist/              # Build output
├── .github/                   # GitHub workflows & templates
├── turbo.json                 # Turborepo configuration
└── package.json               # Root package.json
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter nestjs-trpc-v2 build
```

### Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Publishing

This package is automatically published to npm when a new release is created or when a version tag is pushed. See the [Publishing Guide](CONTRIBUTING.md#publishing) for more details.

## Migration from nestjs-trpc

Migrating from the original `nestjs-trpc` is straightforward:

1. Update your package.json:

```diff
- "nestjs-trpc": "^x.x.x"
+ "nestjs-trpc-v2": "^0.0.1"
```

2. Update your imports:

```diff
- import { Router, Query } from 'nestjs-trpc';
+ import { Router, Query } from 'nestjs-trpc-v2';
```

3. Run `pnpm install` (or your package manager)

The API remains compatible with the original library, so no code changes should be necessary beyond updating the package name.

## Credits & License

### Original Library

**nestjs-trpc-v2** is a maintained fork of [nestjs-trpc](https://github.com/KevinEdry/nestjs-trpc), originally developed by [Kevin Edry](https://twitter.com/KevinEdry). The original library took huge inspiration from both NestJS and tRPC inner workings.

#### Original Contributors

<a href="https://github.com/KevinEdry/nestjs-trpc/graphs/contributors">
  <p align="center">
    <img width="720" src="https://contrib.rocks/image?repo=kevinedry/nestjs-trpc" alt="Contributors to the original nestjs-trpc repository" />
  </p>
</a>

### This Fork

This fork is maintained by [Michael Guay](https://michaelguay.dev) and the community.

### License

MIT - See [LICENSE](LICENSE) file for details.

---

**⭐ If this library helps you, please consider giving it a star!**

For questions or support:

- 📖 [Documentation](https://nestjs-trpc-v2.io/docs) (original docs, still applicable)
- 🐛 [Report Issues](https://github.com/mguay22/nestjs-trpc-v2/issues)
- 💬 [Discussions](https://github.com/mguay22/nestjs-trpc-v2/discussions)
- 🔗 [Original Repository](https://github.com/KevinEdry/nestjs-trpc)
