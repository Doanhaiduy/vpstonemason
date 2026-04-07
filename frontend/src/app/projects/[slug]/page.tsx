import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import { ProjectDetailClient } from '@/components/projects/ProjectDetailClient';

export const revalidate = 3600; // ISR: revalidate every hour

export async function generateStaticParams() {
  try {
    const res = await api.getProjects();
    const projects = (res.data || []) as any[];
    return projects
      .filter((p) => p.slug)
      .map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: { slug: string };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const project = await api.getProjectBySlug(params.slug).catch(() => null);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={project} />;
}
