import { docs } from 'fumadocs-mdx:collections/server';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  // Explicitly disable i18n to ensure pageTree returns Root instead of Record<string, Root>
  i18n: undefined,
});
