import '../styles/globals.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Analytics } from '@vercel/analytics/react';
import { GeistSans } from 'geist/font/sans';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <Analytics />
          {children}
        </RootProvider>
      </body>
    </html>
  );
}

export const metadata = {
  title: 'NestJS-tRPC v2: Bringing type-safety to NestJS',
  description:
    'NestJS tRPC is a library designed to integrate the capabilities of tRPC into the NestJS framework. It aims to provide native support for decorators and implement an opinionated approach that aligns with NestJS conventions.',
  icons: {
    icon: '/favicon/favicon-32x32.png',
    apple: '/favicon/apple-touch-icon.png',
  },
  openGraph: {
    title: 'NestJS-tRPC v2: Bringing type-safety to NestJS',
    description:
      'NestJS tRPC is a library designed to integrate the capabilities of tRPC into the NestJS framework. It aims to provide native support for decorators and implement an opinionated approach that aligns with NestJS conventions.',
    url: 'https://nestjs-trpc-v2.io/',
    siteName: 'NestJS-tRPC v2: Bringing type-safety to NestJS',
    images: [
      {
        url: '/og.jpg',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'NestJS-tRPC v2: Bringing type-safety to NestJS',
    description: 'NestJS-tRPC v2: Bringing type-safety to NestJS',
    images: ['https://nestjs-trpc-v2.io/banner.png'],
  },
};
