import { permanentRedirect } from 'next/navigation';

interface PageProps {
  params: { slug: string };
}

export default function LegacyStoneRedirectPage({ params }: PageProps) {
  const { slug } = params;
  permanentRedirect(`/catalog?search=${encodeURIComponent(slug)}`);
}
