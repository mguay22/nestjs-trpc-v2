<a href="https://nestjs-trpc-v2.io/" target="_blank" rel="noopener">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://i.imgur.com/JvsOXCg.png" />
    <img alt="tRPC" src="https://i.imgur.com/JvsOXCg.png" />
  </picture>
</a>

<div align="center">
  <h1>Nestjs tRPC Adapter</h1>
  <h3>An opinionated approach to building<br />End-to-end typesafe APIs with tRPC within NestJS.</h3>
  <a href="https://npmcharts.com/compare/nestjs-trpc-v2?interval=30">
    <img alt="weekly downloads" src="https://img.shields.io/npm/dm/nestjs-trpc-v2.svg">
  </a>
  <a href="https://github.com/mguay22/nestjs-trpc-v2/blob/main/LICENSE">
    <img alt="MIT License" src="https://img.shields.io/github/license/mguay22/nestjs-trpc-v2" />
  </a>
  <a href="https://discord.gg/trpc-867764511159091230">
    <img alt="Discord" src="https://img.shields.io/discord/867764511159091230?color=7389D8&label&logo=discord&logoColor=ffffff" />
  </a>
  <br />
  <figure>
    <img src="https://assets.trpc.io/www/v10/v10-dark-landscape.gif" alt="Demo" />
    <figcaption>
      <p align="center">
        The client above is <strong>not</strong> importing any code from the server, only its type declarations.
      </p>
    </figcaption>
  </figure>
</div>

## Introduction

**NestJS tRPC** is a library designed to integrate the capabilities of tRPC into the NestJS framework. It aims to provide native support for decorators and implement an opinionated approach that aligns with NestJS conventions.

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

To install **NestJS tRPC** with your preferred package manager, you can use any of the following commands:

```shell
# npm
npm install trpc-nestjs zod @trpc/server

# pnpm
pnpm add trpc-nestjs zod @trpc/server

# yarn
yarn add trpc-nestjs zod @trpc/server
```

## How to use

Here's a brief example demonstrating how to use the decorators available in **NestJS tRPC**:

```typescript
// users.router.ts
import { Inject } from "@nestjs/common";
import { Router, Query, UseMiddlewares } from "trpc-nestjs";
import { UserService } from "./user.service";
import { ProtectedMiddleware } from "./protected.middleware";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
        code: "INTERNAL_SERVER_ERROR",
        message: "An error has occured when trying to get users.",
        cause: error,
      });
    }
  }
}
```

**👉 See full documentation on [NestJS-tRPC.io](https://nestjs-trpc-v2.io/docs). 👈**
