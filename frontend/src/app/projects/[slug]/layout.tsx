import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { buildAlternates } from '@/lib/seo';
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumb';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const project = await api.getProjectBySlug(params.slug);

    if (!project) {
      return {
        title: 'Project Not Found',
      };
    }

    const title = `${project.name} | Stone Projects Melbourne`;
    const description = project.description?.slice(0, 150) || `View the ${project.name} project by PVStone. Premium stone fabrication and installation.`;
    const imageUrl = project.images?.[0]?.url || undefined;
    
    const keywords = ['stone project', project.location?.suburb, project.location?.state, 'stone fabrication'].filter(Boolean);
    if (project.applicationType) {
      keywords.push(...project.applicationType);
    }

    return {
      title,
      description,
      keywords: keywords as string[],
      openGraph: {
        title: `${project.name} | PVStone Projects`,
        description,
        images: imageUrl ? [{ url: imageUrl }] : undefined,
        type: 'article',
      },
      alternates: {
        ...buildAlternates(`/projects/${params.slug}`),
      },
    };
  } catch (error) {
    return {
      title: 'Project',
      description: 'Explore completed stone benchtop projects by PVStone in Melbourne, Australia.',
      alternates: buildAlternates(`/projects/${params.slug}`),
    };
  }
}

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const project = await api.getProjectBySlug(params.slug).catch(() => null);

  return (
    <>
      {project && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildBreadcrumbJsonLd([
                { name: 'Projects', url: '/projects' },
                { name: project.name, url: `/projects/${params.slug}` },
              ]),
            ),
          }}
        />
      )}
      {children}
    </>
  );
}
