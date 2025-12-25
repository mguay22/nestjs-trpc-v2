// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<
  typeof Config,
  import('fumadocs-mdx/runtime/types').InternalTypeConfig & {
    DocData: {};
  }
>();
const browserCollections = {
  docs: create.doc('docs', {
    'client.mdx': () => import('../content/docs/client.mdx?collection=docs'),
    'context.mdx': () => import('../content/docs/context.mdx?collection=docs'),
    'dependency-injection.mdx': () =>
      import('../content/docs/dependency-injection.mdx?collection=docs'),
    'graphql.mdx': () => import('../content/docs/graphql.mdx?collection=docs'),
    'index.mdx': () => import('../content/docs/index.mdx?collection=docs'),
    'integrations.mdx': () =>
      import('../content/docs/integrations.mdx?collection=docs'),
    'middlewares.mdx': () =>
      import('../content/docs/middlewares.mdx?collection=docs'),
    'nestjs.mdx': () => import('../content/docs/nestjs.mdx?collection=docs'),
    'routers.mdx': () => import('../content/docs/routers.mdx?collection=docs'),
    'structure.mdx': () =>
      import('../content/docs/structure.mdx?collection=docs'),
    'trpc.mdx': () => import('../content/docs/trpc.mdx?collection=docs'),
  }),
};
export default browserCollections;
