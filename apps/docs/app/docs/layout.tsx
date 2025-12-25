import { Layout, Navbar } from 'nextra-theme-docs';
import { Banner } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';
import { Footer } from '../../components/Footer';

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageMap = await getPageMap('/docs');

  return (
    <Layout
      pageMap={pageMap}
      docsRepositoryBase="https://github.com/mguay22/nestjs-trpc-v2"
      darkMode={false}
      banner={
        <Banner storageKey="v2-fork" dismissible>
          <a href="https://github.com/mguay22/nestjs-trpc-v2" target="_blank">
            ⚡ This is a maintained fork: nestjs-trpc-v2 - Active development
            with modern tooling →
          </a>
        </Banner>
      }
      navbar={
        <Navbar
          logo={
            <div className="flex items-center gap-2 font-bold">
              <img
                src="/logo.png"
                alt="nestjs-trpc logo"
                width={40}
                height={40}
              />
              <span>NestJS tRPC v2</span>
            </div>
          }
          projectLink="https://github.com/mguay22/nestjs-trpc-v2"
          chatLink="https://discord.gg/trpc-867764511159091230"
        />
      }
      footer={<Footer />}
      sidebar={{ defaultMenuCollapseLevel: 1 }}
    >
      {children}
    </Layout>
  );
}
