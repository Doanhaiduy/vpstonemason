function decodeMapText(value: string): string {
  const plusNormalized = value.replace(/\+/g, ' ').trim();

  try {
    return decodeURIComponent(plusNormalized);
  } catch {
    return plusNormalized;
  }
}

function extractIframeSrc(rawValue: string): string {
  const iframeSrcMatch = rawValue.match(/src=["']([^"']+)["']/i);
  return (iframeSrcMatch?.[1] || rawValue).replace(/&amp;/g, '&').trim();
}

function isGoogleMapsHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host.includes('google.') || host.includes('maps.app.goo.gl') || host.includes('goo.gl');
}

function toEmbedQueryUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

function extractQueryFromGoogleUrl(url: URL): string {
  const q = url.searchParams.get('q') || url.searchParams.get('query');
  if (q) return decodeMapText(q);

  const placeMatch = url.pathname.match(/\/place\/([^/]+)/i);
  if (placeMatch?.[1]) {
    return decodeMapText(placeMatch[1]);
  }

  const latLngMatch = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (latLngMatch?.[1] && latLngMatch?.[2]) {
    return `${latLngMatch[1]},${latLngMatch[2]}`;
  }

  return url.href;
}

export function toGoogleMapsEmbedUrl(
  rawValue: string,
  fallbackValue = '',
): string {
  const trimmedValue = extractIframeSrc(String(rawValue || ''));

  if (!trimmedValue) {
    const fallback = extractIframeSrc(String(fallbackValue || ''));
    return fallback;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmedValue);
  } catch {
    // Treat non-URL input as a plain address query.
    return toEmbedQueryUrl(trimmedValue);
  }

  if (!isGoogleMapsHost(parsedUrl.hostname)) {
    return trimmedValue;
  }

  if (
    parsedUrl.pathname.includes('/maps/embed') ||
    parsedUrl.searchParams.get('output') === 'embed'
  ) {
    return parsedUrl.toString();
  }

  const query = extractQueryFromGoogleUrl(parsedUrl);
  if (!query) {
    const fallback = extractIframeSrc(String(fallbackValue || ''));
    return fallback || trimmedValue;
  }

  return toEmbedQueryUrl(query);
}
