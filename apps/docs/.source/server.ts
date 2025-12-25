// @ts-nocheck
import * as __fd_glob_11 from '../content/docs/trpc.mdx?collection=docs';
import * as __fd_glob_10 from '../content/docs/structure.mdx?collection=docs';
import * as __fd_glob_9 from '../content/docs/routers.mdx?collection=docs';
import * as __fd_glob_8 from '../content/docs/nestjs.mdx?collection=docs';
import * as __fd_glob_7 from '../content/docs/middlewares.mdx?collection=docs';
import * as __fd_glob_6 from '../content/docs/integrations.mdx?collection=docs';
import * as __fd_glob_5 from '../content/docs/index.mdx?collection=docs';
import * as __fd_glob_4 from '../content/docs/graphql.mdx?collection=docs';
import * as __fd_glob_3 from '../content/docs/dependency-injection.mdx?collection=docs';
import * as __fd_glob_2 from '../content/docs/context.mdx?collection=docs';
import * as __fd_glob_1 from '../content/docs/client.mdx?collection=docs';
import { default as __fd_glob_0 } from '../content/docs/meta.json?collection=docs';
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<
  typeof Config,
  import('fumadocs-mdx/runtime/types').InternalTypeConfig & {
    DocData: {};
  }
>({ doc: { passthroughs: ['extractedReferences'] } });

export const docs = await create.docs(
  'docs',
  'content/docs',
  { 'meta.json': __fd_glob_0 },
  {
    'client.mdx': __fd_glob_1,
    'context.mdx': __fd_glob_2,
    'dependency-injection.mdx': __fd_glob_3,
    'graphql.mdx': __fd_glob_4,
    'index.mdx': __fd_glob_5,
    'integrations.mdx': __fd_glob_6,
    'middlewares.mdx': __fd_glob_7,
    'nestjs.mdx': __fd_glob_8,
    'routers.mdx': __fd_glob_9,
    'structure.mdx': __fd_glob_10,
    'trpc.mdx': __fd_glob_11,
  },
);
