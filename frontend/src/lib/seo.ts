export function buildAlternates(canonicalPath: string) {
  return {
    canonical: canonicalPath,
    languages: {
      'en-AU': canonicalPath,
      'x-default': canonicalPath,
    },
  };
}