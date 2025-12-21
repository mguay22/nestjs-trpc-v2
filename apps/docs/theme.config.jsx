import { Footer } from './components/Footer';

export default {
  logo: (
    <div className={'nx-inline-flex nx-gap-2 nx-items-center nx-font-bold'}>
      <img src={'/logo.png'} alt={'nestjs-trpc logo'} width={40} /> NestJS tRPC
      v2
    </div>
  ),
  primaryHue: 200,
  primarySaturation: 100,
  project: {
    link: 'https://github.com/mguay22/nestjs-trpc-v2',
  },
  footer: {
    component: <Footer />,
  },
  banner: {
    key: 'v2-fork',
    text: (
      <a href="https://github.com/mguay22/nestjs-trpc-v2" target="_blank">
        ⚡ This is a maintained fork: nestjs-trpc-v2 - Active development with
        modern tooling →
      </a>
    ),
    dismissible: true,
  },
  chat: {
    link: 'https://discord.gg/trpc-867764511159091230',
  },
  docsRepositoryBase: 'https://github.com/mguay22/nestjs-trpc-v2',
  sidebar: {
    defaultMenuCollapseLevel: 1,
  },
  nextThemes: {
    defaultTheme: 'dark',
    forcedTheme: 'dark',
  },
  themeSwitch: {
    component: null,
  },
  useNextSeoProps() {
    return {
      defaultTitle: 'NestJS-tRPC v2: Bringing type-safety to NestJS',
      additionalLinkTags: [
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/favicon/apple-touch-icon.png',
        },
        {
          rel: 'manifest',
          href: '/favicon/site.webmanifest',
        },
        ...[16, 32].map((size) => ({
          rel: 'icon',
          type: 'image/png',
          sizes: `${size}x${size}`,
          href: `/favicon/favicon-${size}x${size}.png`,
        })),
        {
          rel: 'canonical',
          href: 'https://nestjs-trpc-v2.io/',
        },
      ],
      additionalMetaTags: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0',
        },
        {
          charset: 'utf-8',
        },
        {
          property: 'og:image',
          content: '/og.jpg',
        },
        {
          property: 'og:type',
          content: 'object',
        },
        {
          property: 'og:title',
          content: 'NestJS-tRPC v2: Bringing type-safety to NestJS',
        },
        {
          property: 'og:description',
          content:
            'NestJS tRPC is a library designed to integrate the capabilities of tRPC into the NestJS framework. It aims to provide native support for decorators and implement an opinionated approach that aligns with NestJS conventions.',
        },
        {
          property: 'description',
          content:
            'NestJS tRPC is a library designed to integrate the capabilities of tRPC into the NestJS framework. It aims to provide native support for decorators and implement an opinionated approach that aligns with NestJS conventions.',
        },
        {
          property: 'og:site_name',
          content: 'NestJS-tRPC v2: Bringing type-safety to NestJS',
        },
        {
          property: 'og:url',
          content: 'https://nestjs-trpc-v2.io/',
        },
        {
          name: 'twitter:card',
          content: 'summary',
        },
        {
          name: 'twitter:image',
          content: 'https://nestjs-trpc-v2.io/banner.png',
        },
        {
          name: 'twitter:title',
          content: 'NestJS-tRPC v2: Bringing type-safety to NestJS',
        },
        {
          name: 'twitter:description',
          content: 'NestJS-tRPC v2: Bringing type-safety to NestJS',
        },
      ],
    };
  },
};
