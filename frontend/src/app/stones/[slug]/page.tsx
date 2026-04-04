import { redirect } from 'next/navigation';

interface PageProps {
  params: { slug: string };
}

export default function LegacyStoneRedirectPage({ params }: PageProps) {
  const { slug } = params;
  redirect(`/catalog?q=${encodeURIComponent(slug)}`);
}
